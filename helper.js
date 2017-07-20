'use strict';

/**
 * Helper
 */
module.exports = {
  ucWords(string) {
    return string.replace('/\w\S*/g', (str) => str.charAt(0).toUpperCase() + str.substr(1).toLowerCase()); // eslint-disable-line no-useless-escape
  },
  formatNumber(x) {
    return x.toLocaleString('en');
  },
  formatBytes(bytes, decimals) {
    const b = parseInt(bytes, 10);
    if (b === 0) {
      return '0 Byte';
    }
    const k = 1024;
    const dm = decimals + 1 || 3;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(b) / Math.log(k));
    return `${(b / Math.pow(k, i)).toPrecision(dm)} ${sizes[i]}`; // eslint-disable-line no-restricted-properties
  },
  getMessage(message) {
    let m = '';
    if (message) {
      m = message.toString().trim();
    } else {
      m = '';
    }
    return (m.length > 0 ? m : 'N/A');
  },
  parseCommand(message) {
    const m = this.removeSlackMessageFormatting(message);
    const tokens = m.split(' ');
    const command = [];
    const cmd = tokens.shift();
    const match = cmd.match(/(\w*)/);
    if (match.length > 0) {
      command[match[1]] = tokens;
    }
    return command;
  },
  getFallbackMessage(fields) {
    const data = [];
    fields.forEach((entry) => {
      if (entry.title && entry.title.length > 0) {
        data.push(`${entry.title}: ${entry.value}`);
      }
    });

    return data.join(', ');
  },
  removeSlackMessageFormatting(text) {
    let t = text.replace(/<([@#!])?([^>|]+)(?:\|([^>]+))?>/g, (() =>
      (m, type, link, label) => {
        if (type === '!') {
          if (link === 'channel' || link === 'group' || link === 'everyone') {
            return `@${link}`;
          }
          return '';
        }
        const l = link.replace(/^mailto:/, '');
        if (label && l.indexOf(label) === -1) {
          return `${label} (${l})`;
        }
        return l;
      })(this));
    t = text.replace(/&lt;/g, '<');
    t = text.replace(/&gt;/g, '>');
    t = text.replace(/&amp;/g, '&');
    return t;
  },
  validateIp(ip) {
    const matcher = /^(?:(?:2[0-4]\d|25[0-5]|1\d{2}|[1-9]?\d)\.){3}(?:2[0-4]\d|25[0-5]|1\d{2}|[1-9]?\d)$/;
    return matcher.test(ip);
  },
};
