// 我希望用基于vue3构建的uniapp框架来开发微信小程序，我要做一个to-do list，可以添加删除编辑to-do，给我一个UI界面
<template>
  <view class="container">
    <view class="header">
      <text class="title">我的待办</text>
    </view>
    
    <view class="input-container">
      <input 
        class="todo-input" 
        v-model="newTodo" 
        placeholder="添加新的待办事项" 
        @input="onInput"
      />
      <button class="add-btn" @tap="addTodo">添加</button>
    </view>
    
    <view class="todo-list">
      <view v-for="(todo, index) in todos" :key="index" class="todo-item">
        <view class="todo-content">
          <checkbox 
            :checked="todo.completed" 
            @tap="toggleTodo(index)" 
            color="#10B981"
          />
          <text 
            :class="['todo-text', { 'completed': todo.completed }]"
            @tap="editTodo(index)"
          >
            {{ todo.text }}
          </text>
        </view>
        <view class="todo-actions">
          <button class="edit-btn" @tap="editTodo(index)">编辑</button>
          <button class="delete-btn" @tap="deleteTodo(index)">删除</button>
        </view>
      </view>
    </view>
    
    <view v-if="todos.length === 0" class="empty-state">
      <text>还没有待办事项，开始添加吧！</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'

const newTodo = ref('')
const todos = ref([
  { text: '学习 Vue 3', completed: false },
  { text: '完成微信小程序开发', completed: false },
  { text: '准备周会演示', completed: true },
  { text: '健身 1 小时', completed: false },
  { text: '阅读一章书', completed: false }
])

const onInput = (e) => {
  newTodo.value = e.detail.value
}

const addTodo = () => {
  if (newTodo.value.trim()) {
    todos.value.unshift({
      text: newTodo.value.trim(),
      completed: false
    })
    newTodo.value = ''
  }
}

const toggleTodo = (index) => {
  todos.value[index].completed = !todos.value[index].completed
}

const deleteTodo = (index) => {
  todos.value.splice(index, 1)
}

const editTodo = (index) => {
  uni.showModal({
    title: '编辑待办事项',
    content: todos.value[index].text,
    editable: true,
    success: (res) => {
      if (res.confirm && res.content.trim()) {
        todos.value[index].text = res.content.trim()
      }
    }
  })
}
</script>

<style scoped>
.container {
  padding: 20px;
  background-color: #F3F4F6;
  min-height: 100vh;
}

.header {
  margin-bottom: 20px;
}

.title {
  font-size: 24px;
  font-weight: bold;
  color: #374151;
}

.input-container {
  display: flex;
  margin-bottom: 20px;
}

.todo-input {
  flex: 1;
  padding: 10px;
  border: 1px solid #D1D5DB;
  border-radius: 4px;
  font-size: 16px;
}

.add-btn {
  margin-left: 10px;
  padding: 0 20px;
  background-color: #10B981;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
}

.todo-list {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.todo-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #E5E7EB;
}

.todo-content {
  display: flex;
  align-items: center;
  flex: 1;
}

.todo-text {
  margin-left: 10px;
  font-size: 16px;
  color: #374151;
}

.completed {
  text-decoration: line-through;
  color: #9CA3AF;
}

.todo-actions {
  display: flex;
}

.edit-btn, .delete-btn {
  margin-left: 10px;
  padding: 5px 10px;
  font-size: 14px;
  border: none;
  border-radius: 4px;
}

.edit-btn {
  background-color: #3B82F6;
  color: white;
}

.delete-btn {
  background-color: #EF4444;
  color: white;
}

.empty-state {
  text-align: center;
  padding: 40px 0;
  color: #6B7280;
  font-size: 16px;
}
</style>