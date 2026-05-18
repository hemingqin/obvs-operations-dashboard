import json
import logging

import redis
import redis.asyncio as async_redis

from config import settings

logger = logging.getLogger("app.redis")
_client = None
_async_client = None


def get_redis_client():
    global _client

    if _client is not None:
        return _client

    try:
        _client = redis.Redis.from_url(
            settings.redis_url,
            decode_responses=True,
        )
        _client.ping()
    except redis.RedisError:
        logger.warning("Redis unavailable; continuing without cache/rate limiting")
        _client = False

    return _client


async def get_async_redis_client():
    global _async_client

    if _async_client is not None:
        return _async_client

    try:
        _async_client = async_redis.Redis.from_url(
            settings.redis_url,
            decode_responses=True,
        )
        await _async_client.ping()
    except redis.RedisError:
        logger.warning("Redis unavailable; continuing without realtime notifications")
        _async_client = False

    return _async_client


def publish_json(channel: str, value) -> None:
    client = get_redis_client()
    if not client:
        return

    client.publish(channel, json.dumps(value))


def get_json(key: str):
    client = get_redis_client()
    if not client:
        return None

    value = client.get(key)
    if value is None:
        return None
    return json.loads(value)


def set_json(key: str, value, ttl_seconds: int) -> None:
    client = get_redis_client()
    if not client:
        return

    client.setex(key, ttl_seconds, json.dumps(value))


def get_int(key: str, default: int = 0) -> int:
    client = get_redis_client()
    if not client:
        return default

    value = client.get(key)
    return int(value) if value is not None else default


def increment_with_ttl(key: str, ttl_seconds: int) -> int | None:
    client = get_redis_client()
    if not client:
        return None

    value = client.incr(key)
    if value == 1:
        client.expire(key, ttl_seconds)
    return value


def delete_key(key: str) -> None:
    client = get_redis_client()
    if not client:
        return

    client.delete(key)


def bump_counter(key: str) -> int | None:
    client = get_redis_client()
    if not client:
        return None

    return client.incr(key)
