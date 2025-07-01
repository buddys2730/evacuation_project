# 01. 開発環境セットアップ手順書（完全版）

## 1. はじめに

このドキュメントは、本プロジェクトの開発環境を初めて構築する方のために、クローンから起動までの具体的な手順を説明します。  
初心者の方でもわかるように、OSに依存しない方法を基本とし、Node.jsやPythonのバージョン管理も含めています。

---

## 2. システム要件

- **対応OS**： macOS 10.15以降、Windows 10以降、Linux（Ubuntu推奨）  
- **Node.js**：推奨バージョン 18.x（nvmで管理推奨）  
- **Python**：推奨バージョン 3.10.x（pyenvで管理推奨）  
- **.NET SDK**：8.0.2（バックエンドAPIが必要な場合）  
- **Git**：2.30以降  
- **Docker**：利用する場合は最新の安定版  
- **Cloudflared**：Cloudflare Tunnel用クライアント（[公式インストール手順](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation)参照）

---

## 3. リポジトリのクローン

```bash
# 作業ディレクトリへ移動
cd ~/projects

# GitHubからリポジトリをクローン
git clone https://github.com/buddys2730/evacuation_project.git

# プロジェクトディレクトリへ移動
cd evacuation_project

## 4. Node.js環境セットアップ（フロントエンド）

### 4-1. Node.jsのインストール（nvm利用例）

```bash
# nvmインストール（未インストールの場合）
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.4/install.sh | bash

# nvm読み込み（bash/zshによる）
export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Node.js 18.xをインストール・使用設定
nvm install 18
nvm use 18

# バージョン確認
node -v
npm -v

### 4-2. 依存パッケージのインストール

```bash
# プロジェクトルートの frontend ディレクトリへ移動
cd frontend

# パッケージのインストール（ロックファイルがある場合はnpm ci推奨）
npm ci

### 4-3. 環境変数設定

- `.env` ファイルを `frontend` フォルダに配置してください。例：

```env
REACT_APP_API_BASE_URL=http://localhost:5001/api
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

## 5. Python環境セットアップ（バックエンド）

### 5-1. Pythonインストール（pyenv利用例）

```bash
# pyenvインストール（未インストールの場合）
curl https://pyenv.run | bash

# シェルの設定ファイルに以下を追加
export PATH="$HOME/.pyenv/bin:$PATH"
eval "$(pyenv init --path)"
eval "$(pyenv virtualenv-init -)"

# シェルを再読み込み
exec $SHELL -l

# Python 3.10.xをインストール
pyenv install 3.10.12
pyenv local 3.10.12

# バージョン確認
python --version

### 5-2. 仮想環境作成と有効化

```bash
# backendディレクトリへ移動
cd ../backend

# 仮想環境作成（venv使用）
python -m venv venv

# 仮想環境有効化（Mac/Linux）
source venv/bin/activate
# Windows PowerShellの場合
# .\venv\Scripts\Activate.ps1

# 依存パッケージインストール
pip install --upgrade pip
pip install -r requirements.txt

