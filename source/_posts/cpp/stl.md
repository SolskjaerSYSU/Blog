---
title: 'STL'
date: 2026-04-17
description: '概览 STL 中常见容器、迭代器与泛型编程相关的基础知识。'
tags: ['C++', 'STL']
categories: 'C++'
permalink: posts/cpp/stl/
cover: /images/notes/stl.svg
---
<!-- STL -->


<!-- @import "[TOC]" {cmd="toc" depthFrom=1 depthTo=6 orderedList=false} -->
<!-- code_chunk_output -->

- [STL 组件](#stl-组件)
- [容器](#容器)
  - [容器适配器](#容器适配器)
- [迭代器](#迭代器)
  - [迭代器种类](#迭代器种类)
  - [迭代器适配器](#迭代器适配器)
- [算法](#算法)
  - [remove 元素](#remove-元素)

<!-- /code_chunk_output -->


标准模板库是C++标准库的核心，她深刻影响了标准库的整体结构。STL 是一个泛型程序库，提供一系列软件方案，利用先进、高效的算法来管理数据。程序员无须了解 STL 的原理，便可享受数据结构和算法领域中的这一革新成果。

## STL 组件

若干精心勾画的组件共同合作，构筑起 STL 的基础。这些基础中最关键的是容器、迭代器和算法。

* 容器，用来管理某类对象的集合
* 迭代器，用来在一个对象集合内遍历元素
* 算法，用来处理集合内的元素。他们可以出于不同的目的而查找、排序、修改、使用元素

## 容器
容器用来管理一大群元素。为了适应不同需要，STL 提供了不同的容器。
总的来说，容器可分为三大类：
1. 序列式容器，这是一种有序集合，其内每个元素均有确凿的位置-取决于插入时机和地点，与元素值无关。array、vector、deque、list、forward_list
2. 关联式容器，这是一种已排序集合，元素位置取决于其 value 和给定的某个排序准则。set、multiset、map、multimap
3. 无序容器，这是一种无序集合，其内的每个元素的位置无关紧要，唯一重要的是某个特定元素是否位于此集合内。元素值或其安插顺序，都不影响元素的位置，而且元素的位置有可能在容器生命中被改变。 unordered_set、unordered_multiset、unordered_map、unordered_multimap

### 容器适配器

* stack
* queue
* priority queue

## 迭代器

### 迭代器种类
* 前向迭代器，只能够以累加操作符向前迭代。forward_list 的迭代器就属此类。其他容器如 unordered_set 、 unordered_multiset 、unordered_map 、 unordered_multimap 也都至少是此类别
* 双向迭代器，它可以双向行进：以递增运算前进或以递减运算后退。list,set,multiset,map,multimap提供的迭代器都属此类
* 随机访问迭代器，它不但具备双向迭代器的所有属性，还具备随机访问的能力。更明确的说，他们提供了迭代器算术运算的必要操作符。你可以对迭代器增加或减少一个偏移量、计算两迭代器间的距离，或使用 < 和 > 之类的 relational 操作符进行比较。vector,array,string 提供的迭代器都属此类

### 迭代器适配器
* insert iterator
* stream iterator
* reverse iterator
* move iterator (since c++11)
## 算法

### remove 元素

删除 list 容器中的所有值为 3 的元素：
```cpp
#include <algorithm>
#include <deque>
#include <iostream>
#include <iterator>
#include <list>

using namespace std;

int main(int argc, char const *argv[]) {
  list<int> coll;

  for (int i = 0; i <= 6; i++) {
    coll.push_front(i);
    coll.push_back(i);
  }

  std::cout << "pre: " << ' ';
  copy(coll.cbegin(), coll.cend(), ostream_iterator<int>(cout, " "));
  std::cout << '\n';

  auto newEnd = remove(coll.begin(), coll.end(), 3);

  std::cout << "post: " << ' ';
  copy(coll.begin(), newEnd, ostream_iterator<int>(cout, " "));
  std::cout << '\n';
  return 0;
}
```

该程序运行后的结果为：
```shell
pre:  6 5 4 3 2 1 0 0 1 2 3 4 5 6
post:  6 5 4 2 1 0 0 1 2 4 5 6
```

上面代码的 `post` 行只输出逻辑范围 `[begin, newEnd)`，因此内容才是“移除 3 后保留的元素”。`std::remove` 不会改变容器大小，它把不需要删除的元素搬到前面，并返回新的逻辑末尾；`newEnd` 后面的元素仍然存在，但值不应被依赖。原先若继续打印整个 `list`，尾部会出现看似奇怪的旧值，让人误以为 `remove` 已经完成了物理删除。

要想正确的删除元素，可使用：
```cpp
coll.erase(remove(coll.begin(),coll.end(),3),coll.end());
```

为何算法不自己调用 erase() 呢？这个问题刚好点出 STL 为获取弹性而付出的代价。   


注： 参考 《c++ 标准库第二版》 第六章

## 把 STL 看成一套协作方式

STL 不只是“装数据的容器名单”。它更像三层协作：容器管理元素和存储，迭代器标记一段可操作的范围，算法通过迭代器读写元素。理解这个接口后，一个算法往往可以用于多种容器；但算法能否工作，取决于容器迭代器提供的能力。

```cpp
#include <algorithm>
#include <iostream>
#include <iterator>
#include <vector>

int main() {
    std::vector<int> scores{72, 45, 91, 58, 83};

    std::sort(scores.begin(), scores.end());
    const auto firstPassed = std::lower_bound(scores.begin(), scores.end(), 60);
    std::cout << "及格人数：" << std::distance(firstPassed, scores.end()) << '\n';
}
```

先排序，再用 `lower_bound` 找到第一个不小于 60 的位置，剩余元素就是及格分数。这里的顺序很重要：二分查找类算法要求范围已经按相同规则有序。`sort` 也要求随机访问迭代器，所以可以用于 `vector`，不能直接用于 `list`；链表有自己的成员函数 `list::sort()`。

## 如何按需求选容器

| 需求 | 优先考虑 | 需要知道的代价 |
| --- | --- | --- |
| 连续保存，按下标访问，尾部追加 | `vector` | 中间插入/删除需要移动；扩容会使部分引用和迭代器失效 |
| 两端频繁插入删除 | `deque` | 不保证像 `vector` 一样连续存储 |
| 需要排序后的唯一键/键值 | `set` / `map` | 通常 O(log n)，迭代器为双向迭代器 |
| 只需键值查找，不需要排序 | `unordered_set` / `unordered_map` | 平均查找快，但不保证顺序，哈希冲突时性能会退化 |
| 只想暴露栈/队列接口 | `stack` / `queue` | 它们是适配器，不提供任意位置访问 |

不要只凭“大 O”选容器。数据规模、插入位置、迭代器稳定性、内存局部性和接口限制都可能影响选择。入门练习先使用最贴近问题模型的容器，之后再用基准测试验证是否需要调整。

## 迭代器与失效：修改容器前先问一句

迭代器可以理解成“指向范围中某个位置的游标”，但它不是所有容器都通用的指针。容器结构改变后，原迭代器、引用或指针可能失效。以 `vector` 为例，扩容通常会搬迁全部元素；`erase` 会使被删除位置及其后的迭代器失效。`map` 插入通常不会使已有元素迭代器失效，而删除会使指向被删元素的迭代器失效。具体规则要按容器查阅，不能只记一个通用结论。

```cpp
for (auto it = values.begin(); it != values.end(); ) {
    if (*it < 0) {
        it = values.erase(it); // erase 返回下一个仍有效的位置
    } else {
        ++it;
    }
}
```

这比在 `for` 循环里删除后仍无条件 `++it` 更安全。对 `vector` 删除单个元素仍可能是线性移动；如果需要按条件批量删除，C++20 提供 `std::erase_if(container, predicate)`，旧标准可以使用 erase-remove 惯用法。

## `remove` 为什么不直接删除

`std::remove` 接收一对迭代器，而不是容器本身。它不知道迭代器背后是哪种容器，也没有通用方式调用该容器的 `erase` 成员函数。这个设计让算法能用于不同范围，但“移动元素”和“改变容器大小”被分成两个步骤：

```cpp
values.erase(std::remove(values.begin(), values.end(), 3), values.end());
```

这是对 `vector` 等序列容器常见的 erase-remove 写法。对 `list`，可以直接用成员函数 `values.remove(3)`，语义更贴合链表。读代码时务必区分：算法名相同，不代表实际执行删除的机制完全一样。

## 建议的学习顺序与小练习

1. 用 `vector` 完成追加、遍历、查找和排序，理解 `[begin, end)` 是左闭右开范围。
2. 用 `map` 统计单词出现次数，再用 `unordered_map` 做同一件事，比较输出顺序和接口差异。
3. 删除一个 `vector` 元素后，观察 `erase` 返回值；不要继续使用已失效的迭代器。
4. 试着把 `sort` 应用到 `list`，阅读编译器错误，再使用 `list::sort()`。
5. 对每个容器说明它最擅长的操作、复杂度和一条可能的失效规则。

如果只能记住一个原则：先选对数据模型，再选容器；先确认迭代器要求和失效规则，再调用算法。STL 的强大来自接口组合，而不是死记函数名。

---
- [上一级](README.md)
- 上一篇 -> [MFC 对比 QT](MFC_VS_QT.md)
- 下一篇 -> [一些 Boost 程序库的简单使用](boost.md)



