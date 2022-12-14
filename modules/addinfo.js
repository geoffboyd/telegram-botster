module.exports = {
  contentinfo(bot, channel, from, text, contentType, phrase) {
    if (!text) { return bot.telegram.sendMessage(channel, `You need to tell me what ${phrase} you want to add`) }
    const SQLite = require("better-sqlite3");
    const db = new SQLite('./db/userinputs.sqlite');
    // Check if the table "userinputs" exists.
    const table = db.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'userinputs';").get();
    if (!table['count(*)']) {
      // If the table isn't there, create it and setup the database correctly.
      db.prepare("CREATE TABLE userinputs (row INTEGER NOT NULL PRIMARY KEY, user TEXT, channel TEXT, type TEXT, content TEXT, lastUsed DATETIME, dateAdded DATETIME);").run();
      // Ensure that the "row" row is always unique and indexed.
      db.prepare("CREATE UNIQUE INDEX idx_userinputs_row ON userinputs (row);").run();
      db.pragma("synchronous = 1");
      db.pragma("journal_mode = wal");
    }
    let addInputs = db.prepare("INSERT INTO userinputs (user, channel, type, content, lastUsed, dateAdded) VALUES (@user, @channel, @type, @content, @lastUsed, @dateAdded);");
    let date = Math.floor(new Date() / 1000);
    const dbObject = { user: from, channel: channel.toString(), type: contentType, content: text, lastUsed: date, dateAdded: date };
    try {
      addInputs.run(dbObject);
    } catch (e) {
      return bot.telegram.sendMessage(channel, `Something went wrong`);
    }
    bot.telegram.sendMessage(channel, `A new ${phrase} has been added!`);
  }
}
