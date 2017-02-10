NVM_DIR=/usr/local/nvm
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" && nvm use stable # This loads nvm
[[ -r $NVM_DIR/bash_completion ]] && . $NVM_DIR/bash_completion

export TNVM_DIR="/Users/hax/.tnvm"
[ -s "$TNVM_DIR/tnvm.sh" ] && . "$TNVM_DIR/tnvm.sh"  # This loads nvm

export PATH=~/.composer/vendor/bin:$PATH

if [ -f /usr/local/share/liquidprompt ]; then
    . /usr/local/share/liquidprompt
fi

alias l='ls -aFhlG'
alias ll='ls -FhlG'

alias ..='cd ..'
alias ...='cd ../..'
alias ....='cd ../../..'
alias .....='cd ../../../..'

alias npmls='npm ls --depth=0'
#alias cnpm="npm --registry=https://registry.npm.taobao.org \
#--cache=$HOME/.npm/.cache/cnpm \
#--disturl=https://npm.taobao.org/dist \
#--userconfig=$HOME/.cnpmrc"

alias bfg='java -jar /usr/local/bin/bfg-1.12.12.jar'

alias gulb='gulp --require babel/register'

alias dl='cd ~/Downloads'
alias dt='cd ~/Desktop'

alias dn='node --harmony --expose-gc --trace_opt --trace_deopt --allow-natives-syntax'
alias chd='"/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary" --allow-file-access-from-files --js-flags="--allow-natives-syntax"'
alias chc='"/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary" --js-flags="--allow-natives-syntax --expose-gc --trace_opt --trace_deopt"'

alias hss='http-server -c-1 --cors -S -C ~/localhost-ecc.pem -K ~/localhost-ecc.pem'
