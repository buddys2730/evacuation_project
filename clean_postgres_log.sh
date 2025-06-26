#!/bin/bash
# PostgreSQLサーバーを安全に停止し、巨大ログを削除して再起動

LOGPATH="/opt/homebrew/var/log/postgresql@14.log"

if [ -f "$LOGPATH" ]; then
  echo "■ PostgreSQLサーバー停止"
  brew services stop postgresql@14
  echo "■ 巨大ログ削除: $LOGPATH"
  rm -f "$LOGPATH"
  echo "■ PostgreSQLサーバー起動"
  brew services start postgresql@14
  echo "■ 空き容量を確認してください"
else
  echo "巨大ログはありません"
fi
