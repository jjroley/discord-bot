sudo chmod -R 777 /home/ec2-user/discord-bot

cd /home/ec2-user/discord-bot

npm ci

npm run build

pm2 delete discord-bot
pm2 start "npm run start" --name "discord-bot" --log /home/ec2-user/discord-bot/logs/discord-bot.log