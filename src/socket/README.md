# Laravel Echo + Pusher Integration

## Cấu trúc

```text
src/socket/
├── echo.ts              # Cấu hình Laravel Echo + Pusher
├── NotificationHub.tsx  # Component hiển thị thông báo
├── notificationStore.ts # Store quản lý state thông báo
└── README.md           # Tài liệu hướng dẫn
```

## Sử dụng

### 1. Sử dụng Socket Context

```typescript
import { useSocket } from '../contexts/SocketContext';

const MyComponent = () => {
  const { isConnected, isInitialized } = useSocket();
  
  return (
    <View>
      <Text>Socket Status: {isConnected ? 'Connected' : 'Disconnected'}</Text>
      <Text>Initialized: {isInitialized ? 'Yes' : 'No'}</Text>
    </View>
  );
};
```

### 2. Sử dụng useEcho Hook

```typescript
import { useEchoChannel } from '../hooks/useEcho';
import { useNotificationStore } from '../socket/notificationStore';

const MyComponent = () => {
  const push = useNotificationStore((s) => s.push);
  
  // Listen to specific events
  useEchoChannel('notifications', '.UserNotificationEvent', (data) => {
    push({
      title: 'User Notification',
      message: data.message,
      type: 'info',
    });
  });

  return (
    // JSX của component
  );
};
```

### 3. Sử dụng Notification Store

```typescript
import { useNotificationStore } from '../socket/notificationStore';

const MyComponent = () => {
  const { list, push, clear, remove } = useNotificationStore();
  
  const handleAddNotification = () => {
    push({
      title: 'Test Notification',
      message: 'This is a test notification',
      type: 'success',
    });
  };

  return (
    <View>
      <Button title="Add Notification" onPress={handleAddNotification} />
      {list.map((notification) => (
        <View key={notification.id}>
          <Text>{notification.title}</Text>
          <Text>{notification.message}</Text>
        </View>
      ))}
    </View>
  );
};
```

## Cấu hình

### Thay đổi server configuration

Trong `src/socket/echo.ts`:

```typescript
const API_BASE = 'https://your-api-server.com';
const BROADCAST_HOST = 'your-broadcast-server.com';
const PUSHER_KEY = 'your-pusher-key';
```

### Thay đổi cluster

```typescript
const pusher = new Pusher(PUSHER_KEY, {
    cluster: 'your-cluster', // Thay đổi cluster của bạn
    // ... other config
});
```

## Events được hỗ trợ

- `.NotificationSuccessTransferEvent` - Sự kiện chuyển khoản thành công
- `.NotificationEvent` - Sự kiện thông báo chung

## Troubleshooting

1. **Connection issues**: Kiểm tra token authentication
2. **Subscription errors**: Kiểm tra channel permissions
3. **Toast không hiển thị**: Đảm bảo NotificationHub được render trong App
