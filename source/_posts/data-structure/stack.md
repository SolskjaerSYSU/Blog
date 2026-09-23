---
title: '栈'
date: 2026-04-18
description: '介绍栈的基本模型，并整理数组与链表实现栈时的关键代码。'
tags: ['数据结构', '栈']
categories: '数据结构'
permalink: posts/data-structure/stack/
cover: /images/notes/stack.svg
---
# 栈(stack)

## 概念

- **栈(stack)**是限制插入和删除只能在一个位置上的进行的表，而这个模型唯一的开口位置是表的**末端**，叫做**栈顶(top)**，相反表的首部，叫做**栈底**。对于栈的基本操作有**Push(进栈)**和**Pop(出栈)**，前者相当于插入，后者则是删除表中最后一个元素(也就是处在栈顶位置的元素)。
- *栈是一个先进后出的模型*



**注意事项**：

- 虽然这里将栈放在线性表外，但是栈模型也属于线性表。

- **栈**是既可以用数组实现也可以用链表实现

  > - 如果栈的大小已知且固定，或者对随机访问元素效率有较高要求，使用**数组**实现栈可能更合适。
  > - 如果栈的大小不确定，或者插入和删除操作频繁且在栈顶之外发生，使用**链表**实现栈可能更有优势。









**链表实现代码**：

```cpp
struct Node{
    int data;
    Node *next;
};
typedef Node* Stack;

Stack createStack(int data){
    struct Node* p=new struct Node;
    p->data=data;
    p->next=NULL;
    return p;
}

//进栈
void Push(Stack &head,int data){
    Stack add= createStack(data);
    if(head==NULL){
        head=add;
    }else{
        Node* p=head;
        add->next=p;
        head=add;
    }
}

//出栈
void Pop(Stack &head){
    if(head==NULL){
        cout<<"栈中没有数据"<<endl;
        return;
    }
    Node* p=head;
    head=p->next;
    delete p;
}

//获取栈顶元素
int top(Stack head){
    return head->data;
}


//打印栈
void printStack(Stack head){
    if(head==NULL){
        cout<<"栈中没有数据"<<endl;
        return;
    }
    Node* p=head;
    while (p!=NULL){
        cout<<p->data<<" ";
        p=p->next;
    }
    cout<<endl;
}

//获取栈的大小
int Size(Stack head){
    Node* p=head;
    int cnt=0;
    if(p->data&&p->next==NULL){
        cnt=1;
    } else{
        while (p!=NULL){
            cnt++;
            p=p->next;
        }
    }
    return cnt;
}

//判断栈是否为空
bool empty(Stack head){
    if (head!=NULL){
        return false;
    }else{
        return true;
    }
}

//清空栈
void destroy(Stack &head){
    if(head==NULL){
        cout<<"栈中没有数据"<<endl;
        return;
    }
    Node* tail=head->next;
    while (head!=NULL){
        delete head;
        head=tail;
        if(tail!=NULL)
            tail=tail->next;
        else
            return;
    }
}
```









**数组实现代码：**

```cpp
class stack{
public:
    //入栈
    void Push(int data){
        head.push_back(data);
    }

    //出栈
    void Pop(){
        if(head.empty()){
            cout<<"栈中没有数据！"<<endl;
            return;
        } else
            head.pop_back();
    }

    //获取栈顶元素
    int top(){
        if(head.empty()){
            cout<<"栈中没有数据！"<<endl;
            return NULL;
        }
        return head.back();
    }

    //打印栈
    void printstack(){
        if(head.empty()){
            cout<<"栈中没有数据"<<endl;
            return;
        }else{
            for(vector<int>::const_iterator it=head.end()-1;it>=head.begin();it--){
                cout<<*it<<" ";
            }
            cout<<endl;
        }
    }

    //清空栈
    void destory(){
        head.clear();
    }

    //获取栈的大小
    int Size(){
        return head.size();
    }

    //判断栈是否为空
    bool empty(){
        if(head.empty()){
            return true;
        } else{
            return false;
        }
    }
private:
    vector<int>head;
};
```











## 逆波兰转换式

**概念**：

- 一种**后缀表达式**，例如a+b+c*d，转换成逆波兰表达式就为：a b + c d * +，然后我们将逆波兰表达式压入栈中(*将元素压入栈中遇到运算符号就将栈中的两个元素进行出栈在进行运算，运算完后再压入栈中，重复操作就能得到逆波兰表达式的结果*)，逆波兰表达式中没有括号！

- 转换成逆波兰表达式，需要一个空栈跟一个临时输出区(但不直接输出)，将**运算元素放进临时输出区**，将**运算符号压入栈**中。

  > - 如果运算符的优先级大于上一个运算符，就进行入栈。
  > - 如果运算符的优先级小于等于上一个运算符，就将前面的运算符出栈放在临时输出区，再将该运算符入栈。
  > - 如果栈中有左括号，后面入栈的运算符不是右括号的话，左括号就不出栈，而是继续重复上两个规则，直到右括号出现就将左括号出栈，但括号不放入临时输出区
  > - 当运算元素都放入临时输出区时，栈区还有运算符就直接出栈放入临时存放区，最终将临时存放区按顺序输出出来就是转换的逆波兰表达式



**代码**：

```cpp
bool flag(char a,char b){
    int a1,b1;
    if(a=='+'||a=='-'){
        a1=1;
    }else if(a=='*'||a=='/'){
        a1=2;
    }else if(a=='('||a==')'){
        a1=3;
    }
    if(b=='+'||b=='-'){
        b1=1;
    }else if(b=='*'||b=='/'){
        b1=2;
    }else if(b=='('||b==')'){
        b1=3;
    }
    return a1>=b1;
}

vector<char> reversePolan(char *an,int len){
    stack<char>s;
    vector<char>v;
    int cnt=0;
    for(int i=0;i<len;i++){
        if(an[i]!='+'&&an[i]!='-'&&an[i]!='*'&&an[i]!='/'&&an[i]!='('&&an[i]!=')'){
            v.push_back(an[i]);
        }else if(an[i]=='+'||an[i]=='-'||an[i]=='*'||an[i]=='/'||an[i]=='('||an[i]==')'){
            if(s.empty()){
                s.push(an[i]);
            }else if(an[i]=='('){
                s.push(an[i]);
                cnt=1;
            }else if(an[i]==')'&&cnt==1){
                while (s.top()!='('){
                    v.push_back(s.top());
                    s.pop();
                }
                s.pop();
                cnt=0;
            } else if(flag(s.top(),an[i])){
                while (!s.empty()){
                    if(s.top()=='('){
                        break;
                    }
                    v.push_back(s.top());
                    s.pop();
                }
                s.push(an[i]);
            }else{
                s.push(an[i]);
            }
        }
    }
    if(!s.empty()){
        while (!s.empty()){
            v.push_back(s.top());
            s.pop();
        }
    }
    return v;
}


int main() {
    char an[]={'a','+','b','*','c','+','(','d','*','e','+','f',')','*','g'};
    int len= sizeof(an)/ sizeof(an[0]);
    auto a= reversePolan(an,len);
    for(char i:a){
        cout<<i<<" ";
    }
    cout<<endl;
    system("pause");
    return 0;
}
```





## 单调栈



**概念**：

- 单调栈是一种数据结构，但是因为经常使用就将其放入算法
- 单调栈就是**栈内的元素呈单调递增或者单调递减的(一般指栈顶到栈底)**
- 将一个元素插入单调栈时，为了维护栈的单调性，需要在保证将该元素插入到栈顶后整个栈**满足单调性的前提下弹出最少的元素**。
- 例如：例如，单调递增栈中自顶向下的元素为{0,11,45,81}，插入元素14时为了保持单调性需要依次弹出0、11，操作后栈变为{14,45,81}
- 时间复杂度为`O(n)`





**适用场景**：

- 单调栈可以**求解出某个元素左边或者右边第一个比它大或者小的元素**

- 可以将其分为具体四种问题：

  > 1. 寻找左侧第一个比当前元素大的元素
  > 2. 寻找左侧第一个比当前元素小的元素
  > 3. 寻找右侧第一个比当前元素大的元素
  > 4. 寻找右侧第一个比当前元素小的元素





**各问题解决做法**：

`总结`：

- 查找**比当前大的元素用单调递增栈**，查找**比当前小的元素用单调递减栈**
- 从**左侧**查找就**看插入栈时的栈顶元素**，从**右侧**查找就**看弹出栈时即将插入的元素**

1. `寻找左侧第一个比当前元素大的元素`：

   > - 构造一个**单调递增栈(从栈顶到栈底)**
   > - **从左到右遍历元素**
   > - 如果**当前元素大于栈顶元素**，则将其**加入**(也就是将栈里面小于当前元素的都弹出再插入)；
   > - 如果**小于**，则**当前栈顶元素就是当前遍历的元素左侧第一个比它大的元素**
   > - 如果插入时的**栈为空**，则**说明左侧不存在比当前元素大的元素**

2. `寻找左侧第一个比当前元素小的元素`：

   > - 构造一个**单调递减栈(从栈顶到栈底)**
   > - **从左到右遍历元素**
   > - 如果当前元素**小于**栈顶元素，就**加入**栈中
   > - 如果**大于**，则**当前栈顶元素就是当前遍历元素左侧第一个比它小的元素**
   > - 如果插入时的**栈为空**，则**说明左侧不存在比当前元素小的元素**

3. `寻找右侧第一比当前元素大的元素`：

   > - 构造一个**单调递增栈(从栈顶到栈底)**
   > - **从左到右遍历元素**
   > - 如果**当前遍历元素大于当前栈底元素**，则**当前栈顶元素的右侧第一个比它大的元素就是当前遍历元素**
   > - 如果**小于**，则将其**加入**栈中
   > - 如果在**栈中的元素没有被弹出**，说明栈中**剩下的元素没有右侧比它大的元素**

4. `寻找右侧第一个比当前元素小的元素`：

   > - 构造一个**单调递减栈(从栈顶到栈底)**
   > - **从左到右遍历元素**
   > - 如果**当前遍历元素小于当前栈顶元素**，则**当前栈顶元素的右侧第一个比它小的元素就是当前遍历元素**
   > - 如果**大于**，则**加入**栈中
   > - 如果在**栈中的元素没有被弹出**，说明栈中**剩下的元素没有右侧比它小的元素**







**模板代码**：

1. `单调递增栈`

   ```cpp
   int main(){
       stack<int>st;
       for(int i=0;i<nums.size();++i){
           while(!st.empty()&&nums[i]>nums[st.top()]){
               st.pop();
           }
           st.push(i);
       }
   }
   ```



2. `单调递减栈`

   ```cpp
   int main(){
       stack<int>st;
       for(int i=0;i<nums.size();++i){
           while(!st.empty()&&nums[i]<nums[st.top()]){
               st.pop();
           }
           st.push(i);
       }
   }
   ```

## 把栈用起来：括号匹配

栈最经典的应用之一，是检查括号是否配对。读到左括号时压栈；读到右括号时，栈顶必须是与它匹配的左括号，然后弹出。遍历结束后栈也必须为空。这个过程只需要从左到右扫描一次，因此时间复杂度为 O(n)，额外空间最坏为 O(n)。

```cpp
#include <string>
#include <vector>

bool isValidBrackets(const std::string& text) {
    std::vector<char> open;
    for (char ch : text) {
        if (ch == '(' || ch == '[' || ch == '{') {
            open.push_back(ch);
            continue;
        }
        if (ch != ')' && ch != ']' && ch != '}') continue;
        if (open.empty()) return false;

        const char left = open.back();
        open.pop_back();
        if ((ch == ')' && left != '(') ||
            (ch == ']' && left != '[') ||
            (ch == '}' && left != '{')) {
            return false;
        }
    }
    return open.empty();
}
```

函数名在代码中应使用 ASCII 标识符，实际写成 `isValidBrackets` 会更适合跨工具协作。留意两个容易漏掉的反例：`())` 在扫描到最后一个右括号时栈已空；`([)]` 虽然左右括号数量相等，但嵌套顺序不正确。只统计各种括号的数量无法识别后者，栈能记住“最近尚未闭合”的顺序。

## 逆波兰表达式：栈如何保留运算顺序

后缀表达式把运算符放在操作数之后，例如中缀表达式 `2 + 3 * 4` 对应 `2 3 4 * +`。求值时遇到数字就压栈；遇到二元运算符，就先弹出右操作数，再弹出左操作数，计算 `左 运算符 右` 后把结果压回去。顺序不能颠倒：`8 - 3` 若算成 `3 - 8`，结果就错了。

手推 `2 3 4 * +`：读入 2、3、4 后栈为 `[2, 3, 4]`；遇到 `*`，弹出 4 和 3，压入 12，栈为 `[2, 12]`；遇到 `+`，弹出 12 和 2，压入 14。结束时应恰好剩一个结果，否则表达式不完整或输入有误。表达式转后缀还要认真处理运算符优先级、左结合性和括号；只用字符比较优先级的简化代码，不适用于多位数、空格、一元负号等完整表达式。

## 单调栈：每个元素只进出一次

单调栈通常保存**下标**而不是值，这样得到答案后能直接计算距离。以“每个位置右边第一个更大的元素”为例：从左到右扫描当前值 `x`，只要栈顶位置的值小于 `x`，当前元素就是那个栈顶元素的答案，于是弹出并记录；再把当前下标压栈。遍历结束仍留在栈中的位置没有更大的右侧元素。

```cpp
#include <vector>

std::vector<int> next_greater_index(const std::vector<int>& values) {
    const int n = static_cast<int>(values.size());
    std::vector<int> answer(n, -1);
    std::vector<int> pending;

    for (int i = 0; i < n; ++i) {
        while (!pending.empty() && values[pending.back()] < values[i]) {
            answer[pending.back()] = i;
            pending.pop_back();
        }
        pending.push_back(i);
    }
    return answer;
}
```

虽然代码里有 `while` 套在 `for` 里面，但每个下标最多入栈一次、出栈一次，所以总操作数与 n 成正比，时间复杂度是 O(n)，不是 O(n²)。若题目要求“下一个更大元素的值”，再根据返回下标取 `values[index]`；若要求距离，则计算 `index - i`。严格比较 `<` 还是非严格比较 `<=`，要根据题目的“更大”是否允许相等来选择。

## 选择实现与练习检查

数组实现的栈可用 `std::vector`，在尾部 `push_back`/`pop_back`；链表实现则需要自己处理节点生命周期。标准库的 `std::stack` 是容器适配器，日常使用通常更省心。无论哪种实现，访问 `top()` 或执行弹出前都应保证非空；`pop()` 只删除元素，不返回它。需要得到栈顶值时先读 `top()`，再 `pop()`。

可以用以下小题自检：对 `([]{})`、`([)]`、`((` 逐字符追踪括号栈；对 `5 1 4 2` 写出每一步单调栈下标；解释为什么栈顶到栈底还是栈底到栈顶的“单调”方向必须先定义清楚。若能说出每个元素何时入栈、何时出栈，以及每一步维持的不变量，就已经超越了背模板。



