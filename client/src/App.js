import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './components/Sidebar';
import TaskList from './components/TaskList';
import TaskDetail from './components/TaskDetail';
import TaskForm from './components/TaskForm';
import ProgressCircle from './components/ProgressCircle';
import { mockTasks } from './data/mockData';
import { GlobalStyles } from './styles/GlobalStyles';

const AppContainer = styled.div`
  display: flex;
  height: 100vh;
  background-color: #F5F5F5;
  font-family: 'Inter', sans-serif;
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const Header = styled.header`
  background: white;
  padding: 1rem 2rem;
  border-bottom: 1px solid #E5E5E5;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Logo = styled.h1`
  color: #6B5B95;
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0;
`;

const ContentArea = styled.div`
  flex: 1;
  display: flex;
  overflow: hidden;
`;

const TaskListContainer = styled.div`
  width: 40%;
  background: white;
  border-right: 1px solid #E5E5E5;
  overflow-y: auto;
`;

const TaskDetailContainer = styled.div`
  width: 60%;
  background: white;
  overflow-y: auto;
`;

function App() {
  const [tasks, setTasks] = useState(mockTasks);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Calculate daily progress
  const completedToday = tasks.filter(task => 
    task.status === 'done' && 
    new Date(task.completedAt).toDateString() === new Date().toDateString()
  ).length;
  
  const totalToday = tasks.filter(task => 
    new Date(task.createdAt).toDateString() === new Date().toDateString()
  ).length;

  const progressPercentage = totalToday > 0 ? (completedToday / totalToday) * 100 : 0;

  const handleTaskSelect = (task) => {
    setSelectedTask(task);
  };

  const handleTaskCreate = () => {
    setEditingTask(null);
    setIsFormOpen(true);
  };

  const handleTaskEdit = (task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleTaskSave = (taskData) => {
    if (editingTask) {
      // Edit existing task
      setTasks(prev => prev.map(task => 
        task.id === editingTask.id ? { ...task, ...taskData, updatedAt: new Date() } : task
      ));
      setSelectedTask({ ...editingTask, ...taskData });
    } else {
      // Create new task
      const newTask = {
        id: Date.now().toString(),
        ...taskData,
        createdAt: new Date(),
        updatedAt: new Date(),
        completedAt: null
      };
      setTasks(prev => [newTask, ...prev]);
      setSelectedTask(newTask);
    }
    setIsFormOpen(false);
    setEditingTask(null);
  };

  const handleTaskDelete = (taskId) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
    if (selectedTask?.id === taskId) {
      setSelectedTask(null);
    }
  };

  const handleTaskStatusChange = (taskId, newStatus) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          status: newStatus,
          completedAt: newStatus === 'done' ? new Date() : null,
          updatedAt: new Date()
        };
      }
      return task;
    }));

    if (selectedTask?.id === taskId) {
      setSelectedTask(prev => ({
        ...prev,
        status: newStatus,
        completedAt: newStatus === 'done' ? new Date() : null
      }));
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || task.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <GlobalStyles />
      <AppContainer>
        <Sidebar />
        <MainContent>
          <Header>
            <Logo>Kaizen</Logo>
            <ProgressCircle 
              percentage={progressPercentage}
              completed={completedToday}
              total={totalToday}
            />
          </Header>
          
          <ContentArea>
            <TaskListContainer>
              <TaskList
                tasks={filteredTasks}
                selectedTask={selectedTask}
                onTaskSelect={handleTaskSelect}
                onTaskEdit={handleTaskEdit}
                onTaskDelete={handleTaskDelete}
                onTaskStatusChange={handleTaskStatusChange}
                onTaskCreate={handleTaskCreate}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
              />
            </TaskListContainer>
            
            <TaskDetailContainer>
              {selectedTask ? (
                <TaskDetail
                  task={selectedTask}
                  onEdit={handleTaskEdit}
                  onDelete={handleTaskDelete}
                  onStatusChange={handleTaskStatusChange}
                />
              ) : (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  height: '100%',
                  color: '#6B5B95',
                  fontSize: '1.2rem'
                }}>
                  Select a task to view details
                </div>
              )}
            </TaskDetailContainer>
          </ContentArea>
        </MainContent>

        <AnimatePresence>
          {isFormOpen && (
            <TaskForm
              task={editingTask}
              onSave={handleTaskSave}
              onClose={() => {
                setIsFormOpen(false);
                setEditingTask(null);
              }}
            />
          )}
        </AnimatePresence>
      </AppContainer>
    </>
  );
}

export default App;
