# 部署指南 · 阿里云 ECS（Docker Compose）

## 服务器信息

- 公网 IP：`121.43.208.113`
- 规格：2 核 4G，Alibaba Cloud Linux 3
- 已装：Docker 社区版
- 访问方式：`http://121.43.208.113:3000`（IP + HTTP，后续有域名再加 HTTPS）

---

## 一、安全组放行端口

阿里云控制台 → ECS → 安全组 → 入方向规则，放行：

| 协议 | 端口 | 来源 | 说明 |
| --- | --- | --- | --- |
| TCP | 3000 | 0.0.0.0/0 | 应用访问 |

> 如后续接 Nginx/Caddy 反代，放行 80/443，3000 改绑 `127.0.0.1`。

---

## 二、服务器初始化（首次）

```bash
# 1. 登录服务器
ssh root@121.43.208.113

# 2. 安装 git（Alibaba Cloud Linux 3 默认未安装）
dnf install -y git

# 3. 验证 Docker Compose（ECS 已预装 Docker 26.1.3 + Compose v2.27.0）
docker compose version
```

---

## 三、首次部署

```bash
# 1. 拉取代码
cd /root
git clone https://github.com/qihb/jue-jin.git
cd /root/jue-jin

# 2. 注入 JWT 密钥（必填）：写入同目录 .env，docker compose 会自动读取
echo "JWT_SECRET=$(openssl rand -hex 32)" > .env

# 3. 构建并启动
docker compose up -d --build

# 4. 查看日志
docker compose logs -f

# 5. 验证
curl http://localhost:3000/api/health
# 期望：{"err_no":0,"err_msg":"ok","data":{"status":"ok","time":"..."}}
curl "http://localhost:3000/api/article/feed?limit=1"
# 期望：{"err_no":0,"err_msg":"ok","data":{"list":[...]}}
```

> **注意 · JWT_SECRET 必填**
>
> - `docker-compose.yml` 已改为 `${JWT_SECRET:?...}` 强制注入，未提供时 `docker compose` 会直接报错、不会启动。
> - 应用自身在 `NODE_ENV=production` 且缺少 `JWT_SECRET` 时会**启动即退出**并打印提示（`server/plugins/jwt-guard.ts`），避免静默使用弱密钥。
> - 旧文档中的 `sed -i "s|change-this-to-a-long-random-string|..."` 写法已废弃（compose 中不再存在该默认值）。
> - `.env` 已在 `.gitignore` 中，不会入库；更新代码后密钥保持不变，无需重新生成（重新生成会使已登录用户的 Cookie 失效）。

浏览器访问 `http://121.43.208.113:3000` 即可看到站点。

---

## 四、更新部署

```bash
cd /root/jue-jin

# 拉取最新代码
git pull

# 重新构建并启动（零停机近似；如需真正零停机，接 Nginx + 蓝绿）
docker compose up -d --build

# 查看日志确认启动成功
docker compose logs --tail=50

# 健康检查
curl -s http://localhost:3000/api/health
```

> `git pull` 不会改动同目录 `.env`，`JWT_SECRET` 保持不变；若首次部署遗漏了 `.env`，容器会在启动阶段直接报错退出（日志可见「缺少环境变量 JWT_SECRET」）。

---

## 五、数据持久化

SQLite 数据库文件挂载在宿主机 `./data/juejin.db`，容器重建不丢失。

```bash
# 备份数据库
cp /root/jue-jin/data/juejin.db /root/jue-jin/data/juejin.db.bak.$(date +%Y%m%d)

# 恢复
cp /root/jue-jin/data/juejin.db.bak.20261124 /root/jue-jin/data/juejin.db
docker compose restart
```

---

## 六、常用命令

```bash
# 启动 / 停止 / 重启
docker compose up -d
docker compose stop
docker compose restart

# 查看实时日志
docker compose logs -f --tail=100

# 进入容器排查
docker exec -it juejin sh

# 清理旧镜像（释放磁盘）
docker image prune -f
```

---

## 七、后续优化（可选）

1. **域名 + HTTPS**：域名 A 记录指向 `121.43.208.113`，用 Caddy 自动签 Let's Encrypt 证书，反代 `localhost:3000`；站点切到 HTTPS 后，登录 Cookie 会自动带上 `Secure`
2. **进程守护**：`restart: unless-stopped` 已覆盖崩溃重启；服务器重启后 Docker 服务自启需 `systemctl enable docker`
3. **日志**：compose 已配置 10MB × 3 文件轮转
4. **安全**：`JWT_SECRET` 已改为**强制注入**（缺失即启动失败），首次部署生成随机值并妥善保管，切勿提交到仓库；定期更新系统补丁
5. **CI**：`.github/workflows/ci.yml` 在 `push` / `pull_request` 时依次执行 `lint → typecheck → test → build`，提交前建议本地先跑一遍 `pnpm test`
