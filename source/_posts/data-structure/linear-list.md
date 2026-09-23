---
title: '线性表'
date: 2026-04-18
description: '梳理线性表的定义、数组与链表实现方式，以及相关基础操作。'
tags: ['数据结构', '线性表']
categories: '数据结构'
permalink: posts/data-structure/linear-list/
cover: /images/notes/linear-list.svg
---
# 线性表



## 定义

- 我们将处理一般的形如A1,A2,A3....AN的表成为**线性表**，N为表的大小，我们称N=0的表为空表。对于除空表外的任何表，我们说A<sub>i+1</sub>后继A<sub>i</sub>并称A<sub>i-1</sub>前驱A<sub>i</sub>,表中的第一个元素为A<sub>1</sub>,而最后一个元素为A<sub>N</sub>.





## 简单数组实现表

**概念**：

- 表的实现可以通过数组进行实现，而表的插入和删除，就需要对数组元素进行移动，例如插入，如果向第一个位置插入，我们就需要数组元素都向后移动一位，又如删除第一个元素，就需要将第一个元素删掉，数组元素再向前移动一位。



```c
#include <stdio.h?>
#define SIZE 100

struct List{
    int elements[SIZE];
    int len;  //表中元素的长度(即个数)
};

//创建一个空表对象
struct List* createList(){
    struct List *p;
    p=malloc(sizeof(struct List));
    p->len=0;
    return p;
}

//判断表是否为空
bool isEmpty(struct List* p){
    return p->len==0;
}

//头插法
void inserthead(struct List *p,int x){
    if(p->len>=SIZE){
        printf("表已满");
        return;
    }
    for(int i=p->len;i>0;i--){
        p->elements[i]=p->elements[i-1];
    }
    p->elements[0]=x;
    p->len++;
    return;
}

//尾插法
void insertlast(struct List*p,int x){
    if(p->len>=SIZE){
        printf("表已满");
        return;
    }
    p->elements[p->len]=x;
    p->len++;
    return;
}

//打印表中数据
void printList(struct List *p){
    for(int i=0;i<p->len;i++){
        printf("list element is:%d\n",p->elements[i]);
    }
}

//查找指定值，返回索引
int find(struct List *p,int x){
    for(int i=0;i<p->len;i++){
        if(p->elements[i]==x){
            return i;
        }
    }
    printf("没有找到值为%d的数据\n",x);
    return NULL;
}

//查找表中对应索引的值，返回值
int findkth(struct List *p,int pos){
    if(pos>p->len){
        printf("不存在索引为%d的数据\n",pos);
        return NULL;
    }
    return p->elements[pos];
}

//删除
void delete(struct List *p,int x){
    for(int i=0;i<p->len;i++){
        if(p->elements[i]==x){
            for(int j=i;j<p->len-1;j--){
                p->elements[j]=p->elements[j+1];
            }
            p->len--;
           	break;
        }
    }
}


```

## 把线性表知识整理成一张选择地图

读这些章节时，不要急着问“哪种结构最厉害”，先问“我的操作模式是什么”。线性表只描述元素之间的线性关系；数组、链表和跳表等，是不同的存储与加速策略。下面先给出一张路线图，后文遇到每种结构时可以回来对照。

| 操作需求 | 顺序表 / `vector` | 单链表 | 双链表 |
| --- | --- | --- | --- |
| 按下标访问第 i 个元素 | O(1) | O(n) | O(n) |
| 在尾部追加 | `vector` 摊还 O(1) | 有尾指针时 O(1) | 有尾指针时 O(1) |
| 在已知位置插入/删除 | 后续元素移动，O(n) | 已有前驱时 O(1) | 已有节点时 O(1) |
| 额外存储 | 预留容量或扩容空间 | 每个节点有链接指针 | 每个节点有前后指针 |

表格里的“已知位置”很重要：链表在目标位置前插入可以很快，但如果你手里只有一个值，仍然要从头查找它，查找本身是 O(n)。因此，“链表插入是 O(1)”不能脱离前提理解。现实中 `vector` 连续存储带来的缓存局部性也常常使它在遍历时很快；不要单凭大 O 就断言链表一定更快。

## 顺序表的容量与边界

顺序表需要区分**长度**和**容量**：长度是当前有效元素数量，容量是已分配存储能容纳的元素数量。插入前检查容量，删除后更新长度，访问下标前确认 `0 <= index < size`。C 风格数组没有携带长度，函数常要额外接收元素个数；把数组长度误当成容量、或把最后一个有效下标误写成 `size`，都是常见越界来源。

若用 `std::vector`，通常不必自己手工维护扩容逻辑。知道大概元素数量时，`reserve(n)` 可以减少多次扩容；但 `reserve` 只改变容量，不会创建 n 个可通过 `operator[]` 访问的元素。需要把大小直接设为 n 时应使用构造函数或 `resize(n)`。这个区别值得亲手打印 `size()` 和 `capacity()` 验证。

## 链表的不变量与生命周期

手写链表时，先写下每个操作必须保持的不变量。例如单链表：空表时头指针为空；每个节点只由一个 `next` 指向后继；遍历应能到达所有节点且最终停在空指针。带尾指针的队列还要保证：空表时 `head`、`tail` 都为空；非空时 `tail->next` 为空。删除最后一个节点时只更新头指针、忘记更新尾指针，会留下悬空地址。

每个 `new` 出来的节点都必须有明确的释放路径。若结构需要复制，还要思考复制的是指针地址还是整条节点链；默认浅拷贝可能造成两个对象共同删除同一块内存。学习阶段可以手写节点理解链接关系，实际 C++ 项目优先考虑标准容器或实现正确的资源管理类型。

## 区间问题：别把结构名和使用条件分开

后文介绍的 Sparse Table（常写作 ST 表）适合**静态数组上的可重复贡献区间查询**，典型是区间最小值/最大值。预处理 O(n log n)，查询 O(1)，但它不适合频繁单点修改；若值会持续更新，线段树或树状数组往往更合适。区间查询的下标约定也要统一：本文示例使用 1-based 下标，直接迁移到 0-based 容器时要整体检查 `l`、`r` 和长度公式。

读 ST 表代码时，可以把 `f[i][j]` 翻译成一句话：从 i 开始、长度为 `2^j` 的区间答案。查询 `[l, r]` 时令 `k=floor(log2(r-l+1))`，取左端和右端各一个长度 `2^k` 的块；最小值、最大值这类幂等操作允许两个块重叠，所以覆盖了整个查询区间而不需要担心重复影响答案。这个理由比死记那一行 `max(...)` 更可靠。

## 自测：操作前先说出代价

1. 要在一百万个元素中反复按下标读取，为什么通常优先考虑 `vector`？
2. 只有一个链表节点指针时，删除它之后的节点为什么可能 O(1)，删除它本身又需要什么额外信息？
3. `reserve(100)` 后，`size()` 为什么仍可能是 0？
4. 数据会频繁单点修改时，为什么静态 ST 表不合适？
5. 对每种结构，写出一个不变量和一个容易破坏它的操作。

学线性表不是收集名词，而是训练“数据怎么放、操作怎么做、代价在哪里”这套分析方法。遇到新题时先列出最频繁的操作，再选择存储结构，通常比先背一段模板更有效。









## 链表

**与简单数组实现的优缺点**：

- **优点**：简单数组实现表的插入和删除需要花费大量的时间，尤其当数据量大的时候，则程序的耗时将会难以接受，因此为了避免插入和删除的线性开销，我们需要允许表可以不连续存储，否咋表的部分或全部需要整体移动，因此我们将用**链表**进行实现
- **缺点**：在查找数据的时候，链表所耗的时长更多，因为数组可以直接用索引来获取，但是链表需要遍历表连接的数据，直到找到数据为止。



**概念**：

- **链表**由一系列**不必在内存相连的结构**组成，每一个结构均含有表元素和指向包含该元素后继元的结构的指针，我们称之为*Next指针*。最后一个单元的Next指针指向NULL，NULL是在c中的定义，c中规定为0.



```c
struct Node{
    int data;
    struct Node* next;
};

struct Node *createNode(int data){
    struct Node *p=(struct Node* )malloc(sizeof(struct Node));
    p->data=data;
    p->next=NULL;
    return p;
}

//头插法
struct Node *inserthead(struct Node *head, int data) {
	struct Node *add = createNode(data);
	if (head == NULL) {
		return add;
	}
//	struct Node *p = head;
//	head = add;
//	head->next = p;
//	return head;
	add->next = head;
	return add;
}

//尾插法
struct Node *insert(Node *head,int data){
    struct Node *add=createNode(data);
    if(head==NULL){
        return add;
    }
    while(head->next!=NULL){
        head=head->next;
    }
    head->next=add;
    return head;
}

struct Node *search(Node *head,int data){
    if(head==NULL||head->data==data){
        return head;
    }
    struct Node *p=head;
    while(p->next!=NULL){
        if(p->data==data){
            return p;
        }
        p=p->next;
    }
    return NULL;
}

struct Node *del(Node *head,int data){
    if(head==NULL){
        return head;
    }
    if(head->data==data){
        struct Node *p=head->next;
        free(head);
        return p;
    }
    struct Node *tail=head;
    struct Node *p=head->next;
    while(p!=NULL){
        if(p->data==data){
            break;
        }
        tail=p;
        p=p->next;
    }
    if(p!=NULL&&p->data==data){
        tail->next=p->next;
        free(p);
    }
    return head;
}
//清除链表
struct destoty(Node *head){
    if(head!=NULL){
        destory(head->next);
        free(head);
    }
}
```







## 双向非循环链表

**作用**：

- **有时候以倒序扫描链表更方便**，但是为了实现这个就会多出一条附加链的开销，他**增加了空间的需求**，同时使得插入和删除的开销增加一倍，但是**又简化了删除操作**。

**概念**：

- **双向非循环链表**就是双向的链表，链表中的前后结点都有指向对方的指针，就是A<sub>1</sub>的next为A<sub>2</sub>，但是A<sub>2</sub>又有指针指向A<sub>1</sub>.







代码：

```cpp
struct doublyNode{
    int data;
    struct doublyNode* next;
    struct doublyNode* prev;
};

struct doublyNode *createNode(int data){
    auto* p=(struct doublyNode*)malloc(sizeof(struct doublyNode));
    p->data=data;
    p->prev=NULL;
    p->next=NULL;
    return p;
}

//头插法
struct doublyNode*inserthead(struct doublyNode* head,int data){
    struct doublyNode*add= createNode(data);
    if(head==NULL){
        return add;
    }
    struct doublyNode*p=head;
    head=add;
    head->next=p;
    p->prev=head;
    return head;
}

//尾插法
struct doublyNode * insertlast(struct doublyNode* head,int data){
    struct doublyNode* add= createNode(data);
    if(head==NULL){
        return add;
    }
    struct doublyNode*p=head;
    while (p->next!=NULL){
        p=p->next;
    }
    p->next=add;
    p->prev=p;
    return head;
}

//删除
doublyNode * del(struct doublyNode* head,int data){
    if(head==NULL){
        cout<<"链表没有数据"<<endl;
        return head;
    }
    if(head->data==data){
        struct doublyNode* p=head->next;
        free(head);
        return p;
    }
    struct doublyNode* tail=head;
    struct doublyNode* p=head->next;
    while (p!=NULL){
        if(p->data==data){
            tail->next=p->next;
            free(p);
            return head;
        }
        tail=p;
        p=p->next;
    }
}

void printlist(struct doublyNode* head){
    if(head==NULL){
        cout<<"链表没有数据"<<endl;
    }
    struct doublyNode* p=head;
    while (p!=NULL){
        cout<<p->data<<" ";
        p=p->next;
    }
    cout<<endl;
}
```









## 循环链表

**概念**：

- **循环链表**就是没有表头表尾的链表，例如一般的链表的表尾为NULL,但是循环链表的下一个指向的表头，不仅有**单向循环链表**，而且还有**双向循环链表**，双向循环链表就是表头的前一个指向表尾，表尾的下一个指向表头。
- *C++中的STL库中就已经封装了双向循环链表的类(list)*







代码：

```cpp
//单向循环链表
struct CirNode{
    int data;
    struct CirNode* next;
    struct CirNode *prev;
};

struct CirNode* createNode(int data){
    struct CirNode* p=(struct CirNode*)malloc(sizeof(struct CirNode));
    p->data=data;
    p->next=NULL;
    p->prev=NULL;
    return p;
}

struct CirNode* inserthead(CirNode* head,int data){
    struct CirNode* add= createNode(data);
    if(head==NULL){
        add->next=add;
        add->prev=add;
        return add;
    }
    struct CirNode* p=head;
    struct CirNode* p1=head->next;
    while (p1!=head){
        p1=p1->next;
    }
    head=add;
    head->next=p;
    p1->next=head;
    head->prev=p1;
    p->prev=head;
    return head;
}

//尾插法
struct CirNode* insertlast(CirNode* head,int data){
    struct CirNode* add= createNode(data);
    if(head==NULL){
        add->prev=add;
        add->next=add;
        return add;
    }
    struct CirNode* p=head;
    while(p->next!=head){
        p=p->next;
    }
    p->next=add;
    add->prev=p;
    add->next=head;
    return head;
}

struct CirNode* del(CirNode* head,int data){
    if(head==NULL){
        cout<<"链表没有数据"<<endl;
        return head;
    }
    if(head->data==data){
        struct CirNode* p=head->next;
        p->prev=head->prev;
        free(head);
        return p;
    }
    struct CirNode* tail=head;
    struct CirNode* p=head->next;
    while (p!=head){
        if(p->data==data){
            tail->next=p->next;
            p->next->prev=tail;
            free(p);
            return head;
        }
        tail=p;
        p=p->next;
    }
}

void printlist(CirNode* head){
    if(head==NULL){
        cout<<"链表没有数据"<<endl;
    }
    struct CirNode* p=head;
    do{
        cout<<p->data<<" ";
        p=p->next;
    } while (p!=head);
    cout<<endl;
}
```

















## 跳跃表(跳表)

**概念**：

- **跳跃表是一个随机化的数据结构**，实质就是一种**可以进行二分查找的有序链表**。
- 跳表在**原有的有序链表的基础上面通过随机化算法产生随机级数的节点使其通过节点的索引来实现快速查找**，**提高了插入，删除，查找操作的性能**
- 跳表数据结构是**以O(logN)期望时间进行查找和删除操作的数据结构**



**特性**：

- **有序性**
- **插入新元素通过随机化算法随机分配存储该新元素值的节点级数**，而**级数就代表着这个节点有多少个指针**，例如调表的第k位4阶节点，从最高层到最后一层，每个指针指向第2<sup>i</sup>+k节点(也就是跳过2<sup>i</sup>个节点，i为层数)











**随机化算法**：

- 该算法用于给跳表插入新元素时，进行随机产生k阶节点用于作为新元素值得载体插入在跳表中。
- 虽然是随机的，但是各阶节点的产生是有概率性的，1/2是一阶节点，1/4是2阶节点，大约1/2<sup>i</sup>的节点是i阶节点。





**查找操作**：

- 首先**在最高级索引上查找最后一个小于当前查找元素的位置**，**然后再跳到次高级索引继续查找，直到跳到最底层为止。**
- 跳表的数据结构大大提高了查找操作，跳表的**查找操作类似于二分查找**。





**插入操作**：

1. **随机产生阶数，然后根据阶数跟数值创建节点**

2. 如果**新创建的表头**，则**直接令表头的第一层索引指针指向新创建的节点**，如果**不是就根据上步产生的阶数创建prev数组用来存储每层要插入节点位置的前继节点，遍历每一层，将prev赋值完**。
3. 然后**根据阶数遍历，插入到存储到prev的前继节点的下一个位置。**





**删除操作**：

1. 跟插入操作差不多，**先进行将prev数组赋值**
2. 然后**遍历每层，将每层的前继节点指向被删除节点的下一个节点**。
3. **释放被删除节点的空间**。





**代码**：

```cpp
struct Node{
    int val;     //存储元素值
    vector<Node*>next;   //存储各层数指针的数组
    int level;  //阶数
};


class skiplist{
public:
    skiplist(int level):Maxlevel(level){
        head= createNode(NULL,Maxlevel);
    }
    ~skiplist() {
        Node* tail=head;
        Node* p;
        while (tail!= nullptr){
            p=tail;
            tail=tail->next[0];
            delete p;
        }
        head= nullptr;
    };

    Node* find(int data);
    void insert(int data);
    void del(int data);
    void print();

private:
    Node* head;
    int Maxlevel;

    Node* createNode(int data,int level){
        auto p = new Node;
        p->val=data;
        p->level=level;
        p->next.resize(level,NULL);
        return p;
    }

    int rand_level(){
        int level=1;
        while(rand()%2&&level<=Maxlevel){
            level++;
        }
        return level;
    }


};

Node *skiplist::find(int data) {
    Node* p=head;
    for(int i=Maxlevel-1;i>=0;i--){
        while (p->next[i]!= nullptr&&p->next[i]->val<data){
            p=p->next[i];
        }
    }
    if(p->next[0]!= nullptr&&p->next[0]->val==data){
        return p->next[0];
    }
    return nullptr;
}

void skiplist::insert(int data) {
    int level=rand_level();
    Node* add= createNode(data,level);
    if(head->next[0]== nullptr){
        head->next[0]=add;
        return;
    }
    Node* p=head;
    Node* prev[level];
    for(int i=level-1;i>=0;i--){
        while (p->next[i]!= nullptr&&p->next[i]->val<data){
            p=p->next[i];
        }
        prev[i]=p;
    }
    for(int i=0;i<level;i++){
        add->next[i]=prev[i]->next[i];
        prev[i]->next[i]=add;
    }
}

void skiplist::del(int data) {
    Node* p=head;
    Node* prev[Maxlevel];
    for(int i=Maxlevel-1;i>=0;i--){
        while (nullptr!=p->next[i]&&p->next[i]->val<data){
            p=p->next[i];
        }
        prev[i]=p;
    }
    if(p->next[0]!= nullptr&&p->next[0]->val==data){
        Node* tail=p->next[0];
        for(int i=Maxlevel-1;i>=0;i--){
            if(prev[i]->next[i]!= nullptr&&prev[i]->next[i]->val==data)
                prev[i]->next[i]=prev[i]->next[i]->next[i];
        }
        delete tail;
    }
}

void skiplist::print() {
    Node* p=head->next[0];
    while (p!= nullptr){
        cout<<p->val<<" ";
        p=p->next[0];
    }
    cout<<endl;
}
```





## ST表



**概念**：

- ST表**适用于解决区间最值的问题(RMQ问题)的数据结构**
- ST表**本质是dp算法**，只不过dp是对数组一排一排更新，而RMQ是对数组一列一列动态规划的





**操作**：

例题：给一个数组，有n个数，有m个left，right(left和right为区间边界)，求出这m个区间的最值

1. 首先引入状态f[i\][j]，**f[i\][j]表示从第i个元素开始的长度为2<sup>j</sup>个元素的最值**
2. 将第i个元素开始的2<sup>j</sup>个元素**分成长度相等的两部分，每部分的长度为2<sup>j-1</sup>**
3. `状态转移方程`就为：**f[i\][j]=max(f[i\][j-1]，f[i+2<sup>j-1</sup>\][j-1])**，即两部分的最大值
4. `边界条件`：**f[i\][0]=a[i]**
5. 要询问区间[L,R]的最大值，因区间[L,R]的长度为R-L+1，**求出log<sub>2</sub>(R-L+1)的值，设为x**
6. 因此区间[L,R]就可以分为[L,L+2<sup>x</sup>-1]和[R-2<sup>x</sup>+1,R]两个部分，根据状态转移方程可以得出`区间[L,R]的最大值`：**RMQ(L,R)=max(f[L\][x],f[R-2<sup>x</sup>+1\][x])**
7. **2<sup>x</sup>可以用移位运算1<<x提高效率**











```cpp
int query(int l,int r){
    int x=(int)log(r-l+1)/log(2);    //在c++中log默认为以10为底，所以需要换底
    //或者直接使用log2函数
    int x=(int)log2(r-l+1);
    return max(f[l][x],f[r-(1<<x)+1][x]);
}
```







**代码**：

```cpp
#include <iostream>
#include <math.h>
using namespace std;
//例子
const int N=1e6+10;
int f[N][20];  //20是由log2(n)+1算出来的
int n,m;

int query(int l,int r){
//    int x=(int)log(r-l+1)/log(2);
    int x=(int)log2(r-l+1);
    return max(f[l][x],f[r-(1<<x)+1][x]);
}


int main() {
    cin>>n>>m;
    for(int i=1;i<=n;++i){
        int p;
        cin>>p;
        f[i][0]=p;
    }
    //外层循环是遍历列,列不需要遍历到n，而是2的j次方小于等于n
    // 因为f[i][j]代表的是从i开始的2的j次方个元素的最值，因此j最大只能取到log2(n)
    for(int j=1;(1<<j)<=n;++j){
        for(int i=1;i+(1<<j)-1<=n;++i){
            f[i][j]=max(f[i][j-1],f[i+(1<<(j-1))][j-1]);
        }
    }

    while(m--){
        int x,y;
        cin>>x>>y;
        cout<<query(x,y)<<endl;
    }
    system("pause");
    return 0;
}

```







**例题**：

蓝桥杯2415：附近最小





```cpp
#include <iostream>
#include <vector>
#include <math.h>
using namespace std;


int n, k;

//ST算法
int query(int l, int r, vector<vector<int>> &f) {
    int x = (int)log2(r - l + 1);
    return min(f[l][x], f[r - (1 << x) + 1][x]);
}

int main() {
    cin >> n ;
    int logn = log2(n) + 1;
    vector<vector<int>>f(n + 1, vector<int>(logn));

    for (int i = 1; i <= n; ++i) {
        cin >> f[i][0];
    }

    for (int j = 1; (1 << j) <= n; ++j) {
        for (int i = 1; i + (1 << j) - 1 <= n; ++i) {
            f[i][j] = min(f[i][j - 1], f[i + (1 << (j - 1))][j - 1]);
        }
    }
    cin >> k;
    for (int i = 1; i <= n; ++i) {
        int l = max(1, i - k);
        int r = min(n, i + k);
        cout << query(l, r, f) << " ";
    }
    cout << endl;
    return 0;
}
```



