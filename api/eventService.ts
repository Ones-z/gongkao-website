import type { Event } from "@/entity";
import client from "./client";

export enum EventApi {
  Create = "/event/create",
}

class OptimizedEventService {
  private eventQueue: Event[] = [];
  private isFlushing = false;

  createEvent = (event: Event) => {
    // 优先使用 sendBeacon
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      try {
        const data = JSON.stringify(event);
        const blob = new Blob([data], { type: 'application/json' });
        navigator.sendBeacon(EventApi.Create, blob);
      } catch (e) {
        // sendBeacon 失败时继续使用队列
      }
    }
    // 添加到队列中批量发送
    this.eventQueue.push(event);
    this.scheduleFlush();
  };

  private scheduleFlush = () => {
    if (this.isFlushing) return;

    this.isFlushing = true;

    // 下一帧执行发送，避免阻塞当前操作
    requestAnimationFrame(() => {
      this.flushEvents();
    });
  };

  private flushEvents = () => {
    if (this.eventQueue.length === 0) {
      this.isFlushing = false;
      return;
    }

    const eventsToSend = [...this.eventQueue];
    this.eventQueue = [];
    this.isFlushing = false;

    client.post<any>({
      url: EventApi.Create,
      data: { events: eventsToSend },
      timeout: 3000,
    }).catch(() => {
      // 发送失败时重新加入队列
      this.eventQueue.unshift(...eventsToSend);
    });
  };
}

const optimizedEventService = new OptimizedEventService();
export default optimizedEventService;
