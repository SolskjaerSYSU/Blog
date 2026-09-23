---
title: '队列'
date: 2026-04-18
description: '从先进先出模型出发，理解队列的操作、循环数组、链表实现与广度优先搜索。'
tags: ['数据结构', '队列']
categories: '数据结构'
permalink: posts/data-structure/queue/
cover: /images/notes/queue.svg
---

# 队列（Queue）：把“先来后到”变成一种数据结构

排队买票时，通常先到的人先办理；打印任务也常按提交顺序处理。这种规则对应队列：**从队尾加入元素，从队头取出元素，先进先出（FIFO，First In, First Out）**。队列不是为了让我们随时访问任意元素，而是刻意限制操作位置，让处理顺序保持明确。

## 先用操作理解模型

常见接口包括：

| 操作 | 含义 | 典型复杂度 |
| --- | --- | --- |
| `push(x)` | 在队尾加入 `x` | O(1)（动态数组尾插为摊还 O(1)） |
| `front()` | 查看队头，不删除 | O(1) |
| `pop()` | 删除队头 | O(1)（合适实现下） |
| `empty()` | 判断是否为空 | O(1) |
| `size()` | 查询元素数量 | O(1) |

例如依次执行 `push(4)`, `push(7)`, `push(9)`, `pop()`，队列内容从 `[4, 7, 9]` 变为 `[7, 9]`，下一次 `front()` 得到 `7`。可以在纸上画出队头和队尾的箭头，检查自己是否把入队、出队方向记反。

## 为什么简单的 `vector` 删除法会变慢

用 `vector` 存队列很容易写出入队 `push_back`、出队 `erase(begin())` 的版本。但删除第一个元素后，其余元素都要向前移动，单次出队是 O(n)。连续处理 n 个元素时，总移动量可能达到 O(n²)。这个实现适合教学演示，不适合作为大量操作时的高效队列。

若使用数组实现，可以维护队头索引，并让数组位置循环复用。下例使用 `std::vector` 固定容量，`count` 用来区分空队列和满队列，因此不需要浪费一个数组格子：

```cpp
#include <cstddef>
#include <stdexcept>
#include <vector>

class IntQueue {
public:
    explicit IntQueue(std::size_t capacity)
        : data_(capacity), head_(0), count_(0) {
        if (capacity == 0) {
            throw std::invalid_argument("capacity must be positive");
        }
    }

    bool empty() const { return count_ == 0; }
    std::size_t size() const { return count_; }

    void push(int value) {
        if (count_ == data_.size()) {
            throw std::overflow_error("queue is full");
        }
        const std::size_t tail = (head_ + count_) % data_.size();
        data_[tail] = value;
        ++count_;
    }

    int front() const {
        if (empty()) {
            throw std::out_of_range("queue is empty");
        }
        return data_[head_];
    }

    void pop() {
        if (empty()) {
            throw std::out_of_range("queue is empty");
        }
        head_ = (head_ + 1) % data_.size();
        --count_;
    }

private:
    std::vector<int> data_;
    std::size_t head_;
    std::size_t count_;
};
```

理解循环数组时，关键是“逻辑上的尾部不一定在物理数组末尾”。假设容量为 5，队头在下标 3，队列有 3 个元素，那么队列占据下标 `3、4、0`，队尾下一个位置是 `(3 + 3) % 5 == 1`。取模让索引走到数组末端后回到开头。

有些实现只用 `head` 和 `tail` 两个索引，这时必须额外设计空/满判定：常见做法是空出一个位置，或增加 `count`/标志位。没有这条约定，就可能无法区分“空队列”和“装满一圈的队列”。

## 链表实现：记住队尾，入队才是常数时间

单链表队列至少要维护 `head` 和 `tail` 两个指针。若每次入队都从头遍历到最后一个节点，入队会退化到 O(n)；保存尾指针后，新节点可以直接接到尾部。出队删除头节点是 O(1)。当最后一个节点出队时，别忘了同时把 `tail` 置空，否则它会悬空。

手写链表还要处理节点所有权、释放内存和空队列边界。这个练习适合理解指针与不变量，但日常 C++ 代码一般优先使用标准库容器。尤其要避免用 `NULL` 代表“没有整数结果”：`NULL` 表示空指针常量，不是一个合适的错误返回协议。可用异常、`std::optional<int>`（C++17）或明确的状态返回值。

## 日常 C++：使用 `std::queue`

标准库已经提供队列适配器。它隐藏底层容器，只暴露符合 FIFO 模型的接口：

```cpp
#include <iostream>
#include <queue>

int main() {
    std::queue<int> tasks;
    tasks.push(4);
    tasks.push(7);
    tasks.push(9);

    while (!tasks.empty()) {
        std::cout << tasks.front() << ' ';
        tasks.pop();
    }
    std::cout << '\n';
}
```

输出为 `4 7 9`。注意 `std::queue::pop()` 只删除队头，返回类型是 `void`；如果需要值，要先读取 `front()`。而 `front()` 和 `pop()` 都要求队列非空，因此先检查 `empty()`。队列适配器默认以 `deque` 为底层容器，也可在满足接口要求时使用其他序列容器。

## 队列为什么常出现在图与搜索问题里

广度优先搜索（BFS）从起点出发，先访问距离为 1 的节点，再访问距离为 2 的节点。把“发现但还没处理”的节点放进队列，就能自然保证按层推进：

```cpp
#include <queue>
#include <vector>

std::vector<int> distance(graph.size(), -1);
std::queue<int> pending;
distance[start] = 0;
pending.push(start);

while (!pending.empty()) {
    const int current = pending.front();
    pending.pop();

    for (int next : graph[current]) {
        if (distance[next] != -1) continue;
        distance[next] = distance[current] + 1;
        pending.push(next);
    }
}
```

这里在入队时就标记 `distance`，而不是等出队时才标记，可以避免同一个节点被多个邻居重复加入。对无权图，BFS 求得从起点到各点的最短边数；它不适合直接解决边权不同的最短路问题，那通常需要 Dijkstra 等算法。

## 选择队列时的几个边界

- 空队列调用 `front()` 或 `pop()` 是错误用法；先检查 `empty()`。
- 循环数组要同时想清楚索引回绕、空满判定和容量策略。
- 链表要在“最后一个节点被移除”时同步更新头尾指针。
- 普通队列按 FIFO；`std::priority_queue` 按优先级取元素，不是同一种顺序。
- 若只需“每次取最大/最小值”，考虑优先队列；若需按到达顺序处理，才使用普通队列。

## 动手练习

1. 给 `IntQueue` 增加 `clear()`，并测试清空后重新入队。
2. 把固定容量实现改成“满时返回 `false`”，而不是抛出异常；比较两种接口的调用体验。
3. 用 `std::queue` 模拟打印任务：按顺序加入任务编号，每次完成一个并输出剩余数量。
4. 给一张无权网格图做 BFS，求起点到终点最少需要走几步；测试终点不可达的情况。
5. 解释为什么“数组首元素 erase”不适合大量出队，并给出循环数组的队尾公式。

做完这些题以后，不妨用一句话总结：队列保存的不是“所有历史元素”，而是“等待按先后顺序处理的工作”。能把模型与问题需求对应起来，才是选择数据结构真正有用的地方。
