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

# 2. 安装 Docker Compose 插件（Docker 已装，补 compose 插件）
#    Alibaba Cloud Linux 3 用 dnf
dnf install -y docker-compose-plugin

# 3. 验证
docker compose version
```

---

## 三、首次部署

```bash
# 1. 拉取代码（假设用 git；或用 scp 上传）
mkdir -p /opt/juejin && cd /opt/juejin
git clone <仓库地址> .
# 或：scp -r 本地项目 root@121.43.208.113:/opt/juejin

# 2. 修改 JWT 密钥（生产环境务必修改！）
vi docker-compose.yml
# 把 JWT_SECRET 改成一段长随机字符串，例如：
# openssl rand -hex 32

# 3. 构建并启动
docker compose up -d --build

# 4. 查看日志
docker compose logs -f

# 5. 验证
curl http://localhost:3000/api/health
# 期望：{"err_no":0,"err_msg":"ok","data":{...}}
```

浏览器访问 `http://121.43.208.113:3000` 即可看到站点。

---

## 四、更新部署

```bash
cd /opt/juejin

# 拉取最新代码
git pull

# 重新构建并启动（零停机近似；如需真正零停机，接 Nginx + 蓝绿）
docker compose up -d --build

# 查看日志确认启动成功
docker compose logs --tail=50
```

---

## 五、数据持久化

SQLite 数据库文件挂载在宿主机 `./data/juejin.db`，容器重建不丢失。

```bash
# 备份数据库
cp /opt/juejin/data/juejin.db /opt/juejin/data/juejin.db.bak.$(date +%Y%m%d)

# 恢复
cp /opt/juejin/data/juejin.db.bak.20261124 /opt/juejin/data/juejin.db
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

1. **域名 + HTTPS**：域名 A 记录指向 `121.43.208.113`，用 Caddy 自动签 Let's Encrypt 证书，反代 `localhost:3000`
2. **进程守护**：`restart: unless-stopped` 已覆盖崩溃重启；服务器重启后 Docker 服务自启需 `systemctl enable docker`
3. **日志**：compose 已配置 10MB × 3 文件轮转
4. **安全**：生产环境修改 `JWT_SECRET`，定期更新系统补丁
