# How to check if conversation-service works

Based on the [EduSpace conversation service plan](C:\Users\ASUS\.cursor\plans\eduspace_conversation_service_port_907f8013.plan.md).

---

## 1. Service is up (no auth)

**Start the service:**

```powershell
cd D:\text\ver2\group3\group2\EduSpace\EduSpace_BE\conversation-service
.\mvnw spring-boot:run
```

Wait until you see: `Started ConversationServiceApplication`.

**Check health (no JWT needed):**

```powershell
curl http://localhost:8083/actuator/health
```

Expected: JSON with `"status":"UP"` (and DB, disk, etc. if configured).

**Optional – info:**

```powershell
curl http://localhost:8083/actuator/info
```

---

## 2. REST API (needs JWT)

All chat endpoints require a Keycloak access token. If Keycloak is running (e.g. realm `eduspace` on port 8180):

1. Get a token (e.g. via Keycloak login or client credentials).
2. Call the API with the token:

```powershell
$token = "YOUR_ACCESS_TOKEN"
# List conversations
curl -H "Authorization: Bearer $token" http://localhost:8083/api/v1/conversations

# Create conversation (body: other user ID from account-service)
curl -X POST -H "Authorization: Bearer $token" -H "Content-Type: application/json" -d "{\"otherUserId\":\"some-user-uuid\"}" http://localhost:8083/api/v1/conversations
```

If you get **401** → auth issue (Keycloak URL or token).  
If you get **200** or **201** → REST is working.

---

## 3. WebSocket / STOMP

- Endpoint: `http://localhost:8083/ws` (SockJS).
- Connect with STOMP and send `Authorization: Bearer <accessToken>` in the CONNECT frame (see plan: STOMP ChannelInterceptor).
- Subscribe to e.g. `/topic/conversation/{conversationId}` and send a message via `/app/chat/{conversationId}/send`; the other subscriber should see it in real time.

Quick check: connect with a WebSocket client (e.g. browser devtools or a STOMP script) and confirm the connection is accepted when a valid JWT is sent.

---

## 4. Via API Gateway (full stack)

If you run the whole stack with docker-compose (gateway, Eureka, Keycloak, conversation-service):

- Gateway routes: `/api/v1/conversations/**` and `/ws/**` → conversation-service.
- Use gateway base URL (e.g. `http://localhost:8080`) instead of `http://localhost:8083` for REST and WebSocket.
- Same checks as above, but replace `localhost:8083` with the gateway host:port.

---

## 5. “Done” checklist (from the plan)

| Check | How |
|-------|-----|
| **REST** | Create conversation, list, get history, send message, edit/delete/react, unread count, block/unblock (all with valid JWT). |
| **Realtime** | Two tabs: messages appear in both; read receipts and conversation list update via WebSocket topics. |
| **Video call** | Initiate/accept/decline/end via Azure endpoints + WebSocket notifications; call history persisted. |
| **Deploy** | Runs in docker-compose with gateway routing and Keycloak JWT. |

---

## Quick one-liner (service only)

```powershell
# After service is running:
curl -s http://localhost:8083/actuator/health
```

If you see `"status":"UP"`, the app and DB connection are working.
