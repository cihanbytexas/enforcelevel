import { createCanvas, loadImage } from "@napi-rs/canvas";

export default async function handler(req, res) {
    const { username = "Nafta", xp = 120, requiredXP = 300, level = 5 } = req.query;

    const targetUser = {
        username,
        displayAvatarURL: () => "https://cdn.discordapp.com/embed/avatars/0.png"
    };

    const buffer = await generateLevelCard(targetUser, xp, requiredXP, level);

    res.setHeader("Content-Type", "image/png");
    res.send(buffer);
}

async function generateLevelCard(targetUser, currentXP, requiredXP, level) {
    const progressPercent = Math.min(100, (currentXP / requiredXP) * 100);

    const canvasWidth = 600;
    const canvasHeight = 200;
    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext("2d");

    // Arka plan
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Avatar
    const avatarSize = 120;
    const avatarX = 40;
    const avatarY = 40;
    const avatar = await loadImage(targetUser.displayAvatarURL());

    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
    ctx.restore();

    // Avatar çerçevesi
    ctx.beginPath();
    ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2 + 2, 0, Math.PI * 2);
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Kullanıcı adı
    const usernameX = avatarX + avatarSize + 30;
    const usernameY = avatarY + 40;

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 24px Arial";
    ctx.textAlign = "left";
    ctx.fillText(`@${targetUser.username}`, usernameX, usernameY);

    // XP ve Level bilgisi
    const infoY = usernameY + 40;
    ctx.font = "bold 18px Arial";
    ctx.fillText(`XP: ${currentXP}/${requiredXP}`, usernameX, infoY);

    const levelX = usernameX + 200;
    ctx.fillText(`Level: ${level}`, levelX, infoY);

    // Progress bar
    const barWidth = 400;
    const barHeight = 15;
    const barX = usernameX;
    const barY = infoY + 30;
    const borderRadius = 7;

    ctx.fillStyle = "#333333";
    roundRect(ctx, barX, barY, barWidth, barHeight, borderRadius, true, false);

    const filledWidth = (barWidth * progressPercent) / 100;
    ctx.fillStyle = "#5865F2";
    roundRect(ctx, barX, barY, filledWidth, barHeight, borderRadius, true, false);

    return canvas.toBuffer("image/png");
}

function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
}
