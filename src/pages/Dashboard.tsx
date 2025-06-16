import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Github, Calendar, CheckCircle2, Clock, LogOut, MessageSquare, FileText, LayoutDashboard, User } from 'lucide-react';
import { ProjectModal } from '@/components/ProjectModal';
import { WeekGrid } from '@/components/WeekGrid';
import { Chat } from '@/components/Chat';
import { Posts } from '@/components/Posts';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const Dashboard = () => {
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/');
      return;
    }
    
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    
    // Load user's projects from localStorage
    const userProjects = localStorage.getItem(`projects_${parsedUser.id}`) || '[]';
    setProjects(JSON.parse(userProjects));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    navigate('/');
  };

  const handleAddProject = (week?: number) => {
    setSelectedWeek(week || null);
    setShowProjectModal(true);
  };

  const handleProjectSubmit = (projectData: any) => {
    const newProject = {
      ...projectData,
      id: Math.random().toString(36).substr(2, 9),
      userId: user?.id,
      submissionDate: new Date().toISOString(),
      status: 'Under Review'
    };
    
    const updatedProjects = [...projects, newProject];
    setProjects(updatedProjects);
    localStorage.setItem(`projects_${user?.id}`, JSON.stringify(updatedProjects));
    
    toast.success('Project submitted successfully!');
    setShowProjectModal(false);
  };

  const completedWeeks = projects.filter(p => p.status === 'Approved').length;
  const completionRate = Math.round((completedWeeks / 52) * 100);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-900 text-white font-mono">
      {/* Header */}
      <header className="border-b border-green-500/20 bg-gray-900/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-green-400">52Projects</h1>
            <span className="text-gray-400">Welcome back, {user.name}!</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-gray-800 rounded-full p-1">
              <User className="h-8 w-8 text-green-400 bg-gray-700 rounded-full p-1" />
            </div>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="border-red-500 text-red-400 hover:bg-red-500/10"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-gray-800 border-green-500/20 p-1">
            <TabsTrigger 
              value="dashboard" 
              className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400 px-6 py-2"
            >
              <LayoutDashboard className="h-4 w-4 mr-2" />
              DASHBOARD
            </TabsTrigger>
            <TabsTrigger 
              value="chat" 
              className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400 px-6 py-2"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              CHAT
            </TabsTrigger>
            <TabsTrigger 
              value="posts" 
              className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400 px-6 py-2"
            >
              <FileText className="h-4 w-4 mr-2" />
              POSTS
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-8">
            {/* Add Project Button */}
            <div className="flex justify-end">
              <Button 
                onClick={() => handleAddProject()}
                className="bg-green-500 text-black hover:bg-green-400"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Project
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid md:grid-cols-4 gap-6">
              <Card className="bg-gray-800 border-green-500/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Completed</p>
                      <p className="text-2xl font-bold text-green-400">{completedWeeks}/52</p>
                    </div>
                    <CheckCircle2 className="h-8 w-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-800 border-green-500/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Completion Rate</p>
                      <p className="text-2xl font-bold text-blue-400">{completionRate}%</p>
                    </div>
                    <Calendar className="h-8 w-8 text-blue-400" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-800 border-green-500/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Under Review</p>
                      <p className="text-2xl font-bold text-yellow-400">
                        {projects.filter(p => p.status === 'Under Review').length}
                      </p>
                    </div>
                    <Clock className="h-8 w-8 text-yellow-400" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-800 border-green-500/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Total Repos</p>
                      <p className="text-2xl font-bold text-purple-400">{projects.length}</p>
                    </div>
                    <Github className="h-8 w-8 text-purple-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Week Grid */}
            <Card className="bg-gray-800 border-green-500/20">
              <CardHeader>
                <CardTitle className="text-green-400">Your 52-Week Journey</CardTitle>
              </CardHeader>
              <CardContent>
                <WeekGrid 
                  projects={projects} 
                  onWeekClick={handleAddProject}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chat">
            <Chat />
          </TabsContent>

          <TabsContent value="posts">
            <Posts />
          </TabsContent>
        </Tabs>
      </div>

      <ProjectModal 
        isOpen={showProjectModal}
        onClose={() => setShowProjectModal(false)}
        onSubmit={handleProjectSubmit}
        selectedWeek={selectedWeek}
      />
    </div>
  );
};

export default Dashboard;