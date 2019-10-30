const Discord = require('discord.js');
const auth = require('./auth.json');
const fs = require('fs');

const client = new Discord.Client();
let database = {};

function updateData() {
    fs.readFile('database.json', 'utf8', (err, data) => {
        if (err){
            console.log(err);
        }else {
            console.log(data + " at data");
            database = JSON.parse(data);
        }
    });
}

updateData();

client.on('ready', () => {
    for (let server in client.guilds.array()) {
        let sanitized = client.guilds.array()[server].name.replace(/ /gi, "-");
        if (!(sanitized in database)) {
            let json = database;
            json[`${sanitized}`] = {};
            fs.writeFile('database.json', JSON.stringify(json), 'utf8', (err) => {if (err) throw err; console.log("complete")});
        }
    }
});

function fancyMSG(msg, title, info) {
    const embed = new Discord.RichEmbed()
        .setColor('#0099ff')
        .setTitle(title)
        .setAuthor('Athena', 'https://i.imgur.com/wSTFkRM.png', 'https://discord.js.org')
        .setDescription(info)
        .setThumbnail('https://i.imgur.com/wSTFkRM.png')
        .setTimestamp()
        .setFooter('Athena CTF Manager', 'https://i.imgur.com/wSTFkRM.png');

    msg.channel.send(embed);
}

client.on('message', msg => {
    let prefix = "/";
    const args = msg.content.split(/\s+/g);
    const command = args.shift().slice(prefix.length).toLowerCase();

    if (msg.author.bot) return;

    updateData();

    switch (command) {
        case 'hello':
            msg.channel.send("hi " + msg.guild + " member");
            msg.delete();
            break;
        case 'ctf':
            let json = database;
            if (args[0] == "add") {
                json[msg.guild.name.replace(/ /gi, "-")][`${args[1]}`] = {};
            } else if (args[0] == "delete") {
                delete json[msg.guild.name.replace(/ /gi, "-")][`${args[1]}`];
            } 
            fs.writeFile('database.json', JSON.stringify(json), 'utf8', (err) => {if (err) throw err; console.log("complete")});
            break;
        // case 'score':
        case 'leaderboard':
            fancyMSG(msg, "leaderboard", "1. Tyler\n2. Abhi\n3. Tavin\n4. Ian");
            msg.delete();
            break;
        default:
            break;
    }
});

client.login(auth.token);
