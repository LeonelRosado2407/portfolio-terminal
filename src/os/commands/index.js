import help from './help'
import shortcuts from './shortcuts'
import sendMessage from './sendMessage'
import ls from './ls'
import cd from './cd'
import cat from './cat'
import open from './open'
import pwd from './pwd'
import whoami from './whoami'
import history from './history'
import clear from './clear'
import lang from './lang'
import theme from './theme'
import neofetch from './neofetch'
import reboot from './reboot'
import eggs from './eggs'

// Order here is the order shown by `help`: portfolio shortcuts first, Unix commands after
export const commands = [
  help, ...shortcuts, sendMessage, ls, cd, cat, open, pwd, whoami, history, clear, lang, theme, neofetch, reboot, ...eggs,
]
