const Discord = require('discord.js');
const auth = require('./auth.json');
const fs = require('fs');

const client = new Discord.Client();
let database = {};

function updateData() {
    database = JSON.parse(fs.readFileSync('database.json'))
}

updateData();

client.on('ready', () => {
    for (let server in client.guilds.array()) {
        let sanitized = client.guilds.array()[server].name.replace(/ /gi, "-");
        if (!(sanitized in database)) {
            let json = database;
            json[`${sanitized}`] = {};
            fs.writeFileSync('database.json', JSON.stringify(json));
        }
    }
});

client.on('message', msg => {
    let prefix = "/";
    const args = msg.content.split(/\s+/g);
    const command = args.shift().slice(prefix.length).toLowerCase();

    if (msg.author.bot) return;

    updateData();
    let json; 
    switch (command) {
        case 'hello':
            msg.channel.send("hi " + msg.guild + " member");
            break;
        case 'ctf':
            json = database
            if (args[0] == "add") {
                json[msg.guild.name.replace(/ /gi, "-")][`${args[1]}`] = {};
            } else if (args[0] == "delete") {
                delete json[msg.guild.name.replace(/ /gi, "-")][`${args[1]}`];
            }
            fs.writeFileSync('database.json', JSON.stringify(json));
            break;
        case 'score':
            json = database;
            let ctf = args[0];
            if(msg.author.username in json[msg.guild.name.replace(/ /gi, "-")][`${ctf}`]) {
                json[msg.guild.name.replace(/ /gi, "-")][`${ctf}`][`${msg.author.username}`][`${args[1]}`] = parseInt(args[2]);
            } else {
                json[msg.guild.name.replace(/ /gi, "-")][`${ctf}`][`${msg.author.username}`] = {};
                json[msg.guild.name.replace(/ /gi, "-")][`${ctf}`][`${msg.author.username}`][`${args[1]}`] = parseInt(args[2]);
            }
            fs.writeFileSync('database.json', JSON.stringify(json));
            break;
        case 'leaderboard':
            json = database;
            if (!(args[0] in json[msg.guild.name.replace(/ /gi, "-")])) {
                msg.channel.send("Error msg display formatting later")
            } else {
                let users = []
                for (let user in json[msg.guild.name.replace(/ /gi, "-")][`${args[0]}`]) {
                    total = 0;
                    for (let problem in json[msg.guild.name.replace(/ /gi, "-")][`${args[0]}`][`${user}`]) {
                        total += json[msg.guild.name.replace(/ /gi, "-")][`${args[0]}`][`${user}`][`${problem}`];                    
                    }
                    users.push([user, total])
                }
                console.log(users)

                let sorted = []

                for (let i = 0; i < users.length; i++) {
                    sorted.push(i)
                }

                for (let i = 0; i < sorted.length; i++) {
                    let top = i;
                    for (let j = i+1; j < users.length; j++) {
                        if (users[j][1] > users[top][1]) {
                            top = j;
                        }
                    }
                    let temp = i;
                    sorted[i] = top;
                    sorted[top] = temp;
                }

                for (let i in sorted) {
                    console.log(users[i][0])
                }

                const embed = new Discord.RichEmbed()
                    .setColor('#0099ff')
                    .setTitle("Leaderboard")
                    .setAuthor('Athena', 'https://i.imgur.com/wSTFkRM.png', 'https://discord.js.org')
                    .setDescription("info goes here")
                    .setThumbnail('https://i.imgur.com/wSTFkRM.png')
                    .setTimestamp()
                    .setFooter('Athena CTF Manager', 'https://i.imgur.com/wSTFkRM.png');
            
                msg.channel.send(embed);
            }
            break;
        default:
            break;
    }
});

client.login(auth.token);
