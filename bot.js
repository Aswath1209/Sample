require('dotenv').config();
const { Bot, InlineKeyboard } = require('grammy');
const express = require('express');
const path = require('path');
const app = express();

// Initialize Bot
const bot = new Bot(process.env.BOT_TOKEN);

// Serve the Mini App HTML
app.get('/miniapp', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Database mock (just for the demo)
const userCoins = new Map();

bot.command('start', async (ctx) => {
    await ctx.reply(
        "👋 <b>Welcome to the Mini App Demo Bot!</b>\n\n" +
        "This bot uses a <b>Mini App Bridge</b> to show clean, high-quality ads.\n\n" +
        "💰 Your Balance: <b>" + (userCoins.get(ctx.from.id) || 0) + "</b> coins\n\n" +
        "Type /earn to open the Mini App and get rewards!", 
        { parse_mode: 'HTML' }
    );
});

bot.command('earn', async (ctx) => {
    const miniAppUrl = process.env.MINIAPP_URL || `https://${process.env.RENDER_EXTERNAL_HOSTNAME}/miniapp`;
    
    const kb = new InlineKeyboard()
        .webApp("📺 Watch Ad & Earn", miniAppUrl);

    await ctx.reply(
        "🚀 <b>Ready to earn?</b>\n\nClick the button below to open the Mini App. Watch the short video to claim your 500 coins!",
        { parse_mode: 'HTML', reply_markup: kb }
    );
});

// Handle data sent from the Mini App
bot.on('message:web_app_data', async (ctx) => {
    const data = ctx.message.web_app_data.data;
    const userId = ctx.from.id;

    if (data === 'reward_completed') {
        const currentBalance = userCoins.get(userId) || 0;
        userCoins.set(userId, currentBalance + 500);

        await ctx.reply(
            "✅ <b>Success!</b>\n\nYou finished the ad and earned <b>500</b> coins!\nNew Balance: <b>" + (currentBalance + 500) + "</b> 💰",
            { parse_mode: 'HTML' }
        );
    }
});

bot.catch((err) => {
    console.error("Bot Error:", err.error || err);
});

// Start Express and Bot
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Web server running on port ${PORT}`);
    bot.start();
    console.log("🚀 Demo Bot is running...");
});
