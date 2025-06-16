import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Download, Github, LogOut, Filter, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const Admin = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [weekFilter, setWeekFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/');
      return;
    }
    
    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    
    setUser(parsedUser);
    loadAllProjects();
  }, [navigate]);

  const loadAllProjects = () => {
    // In a real app, this would fetch from a database
    // For demo, we'll load all projects from localStorage
    const allProjects: any[] = [];
    
    // Get all user IDs and their projects
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('projects_')) {
        const userProjects = JSON.parse(localStorage.getItem(key) || '[]');
        allProjects.push(...userProjects);
      }
    }
    
    setProjects(allProjects);
    setFilteredProjects(allProjects);
  };

  useEffect(() => {
    let filtered = projects;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(project => 
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.githubRepo.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Week filter
    if (weekFilter && weekFilter !== 'all') {
      filtered = filtered.filter(project => project.week === parseInt(weekFilter));
    }

    // Status filter
    if (statusFilter && statusFilter !== 'all') {
      filtered = filtered.filter(project => project.status === statusFilter);
    }

    setFilteredProjects(filtered);
  }, [projects, searchTerm, weekFilter, statusFilter]);

  const handleStatusChange = (projectId: string, newStatus: string) => {
    const updatedProjects = projects.map(project => {
      if (project.id === projectId) {
        return { ...project, status: newStatus };
      }
      return project;
    });
    
    setProjects(updatedProjects);
    
    // Update in localStorage
    const projectToUpdate = updatedProjects.find(p => p.id === projectId);
    if (projectToUpdate) {
      const userProjects = updatedProjects.filter(p => p.userId === projectToUpdate.userId);
      localStorage.setItem(`projects_${projectToUpdate.userId}`, JSON.stringify(userProjects));
    }
    
    toast.success(`Project ${newStatus.toLowerCase()}`);
  };

  const handleDownloadCSV = () => {
    const csvContent = [
      ['User ID', 'Project Title', 'GitHub Repo', 'Week', 'Status', 'Submission Date'].join(','),
      ...filteredProjects.map(project => [
        project.userId,
        `"${project.title}"`,
        project.githubRepo,
        project.week,
        project.status,
        new Date(project.submissionDate).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'projects_export.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('CSV downloaded successfully!');
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    navigate('/');
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      'Approved': 'bg-green-500/20 text-green-400',
      'Under Review': 'bg-yellow-500/20 text-yellow-400',
      'Rejected': 'bg-red-500/20 text-red-400'
    };
    
    return variants[status] || 'bg-gray-500/20 text-gray-400';
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-900 text-white font-mono">
      {/* Header */}
      <header className="border-b border-green-500/20 bg-gray-900/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-green-400">Admin Panel</h1>
            <span className="text-gray-400">Welcome, {user.name}!</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              onClick={handleDownloadCSV}
              className="bg-blue-500 text-white hover:bg-blue-400"
            >
              <Download className="h-4 w-4 mr-2" />
              Download CSV
            </Button>
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
        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-800 border-green-500/20">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{projects.length}</div>
                <div className="text-sm text-gray-400">Total Submissions</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-green-500/20">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {projects.filter(p => p.status === 'Approved').length}
                </div>
                <div className="text-sm text-gray-400">Approved</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-green-500/20">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">
                  {projects.filter(p => p.status === 'Under Review').length}
                </div>
                <div className="text-sm text-gray-400">Under Review</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-green-500/20">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">
                  {projects.filter(p => p.status === 'Rejected').length}
                </div>
                <div className="text-sm text-gray-400">Rejected</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-gray-800 border-green-500/20 mb-6">
          <CardHeader>
            <CardTitle className="text-green-400">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-700 border-green-500/30 text-white"
                />
              </div>
              
              <Select value={weekFilter} onValueChange={setWeekFilter}>
                <SelectTrigger className="bg-gray-700 border-green-500/30 text-white">
                  <SelectValue placeholder="Filter by week" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-green-500/30">
                  <SelectItem value="all">All weeks</SelectItem>
                  {Array.from({ length: 52 }, (_, i) => i + 1).map(week => (
                    <SelectItem key={week} value={week.toString()}>
                      Week {week}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-gray-700 border-green-500/30 text-white">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-green-500/30">
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="Under Review">Under Review</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setWeekFilter('all');
                  setStatusFilter('all');
                }}
                className="border-gray-500 text-gray-300 hover:bg-gray-700"
              >
                <Filter className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Projects Table */}
        <Card className="bg-gray-800 border-green-500/20">
          <CardHeader>
            <CardTitle className="text-green-400">
              Project Submissions ({filteredProjects.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-green-500/20">
                    <TableHead className="text-green-400">User</TableHead>
                    <TableHead className="text-green-400">Project Title</TableHead>
                    <TableHead className="text-green-400">Repository</TableHead>
                    <TableHead className="text-green-400">Week</TableHead>
                    <TableHead className="text-green-400">Status</TableHead>
                    <TableHead className="text-green-400">Submitted</TableHead>
                    <TableHead className="text-green-400">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProjects.map((project) => (
                    <TableRow key={project.id} className="border-green-500/10">
                      <TableCell className="text-white">
                        {project.userId}
                      </TableCell>
                      <TableCell className="text-white font-medium">
                        {project.title}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(project.githubRepo, '_blank')}
                          className="border-green-500/30 text-green-400 hover:bg-green-500/10"
                        >
                          <Github className="h-3 w-3 mr-1" />
                          View Repo
                        </Button>
                      </TableCell>
                      <TableCell className="text-white">
                        Week {project.week}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadge(project.status)}>
                          {project.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {new Date(project.submissionDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {project.status !== 'Approved' && (
                            <Button
                              size="sm"
                              onClick={() => handleStatusChange(project.id, 'Approved')}
                              className="bg-green-500 text-black hover:bg-green-400"
                            >
                              <CheckCircle className="h-3 w-3" />
                            </Button>
                          )}
                          {project.status !== 'Rejected' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusChange(project.id, 'Rejected')}
                              className="border-red-500 text-red-400 hover:bg-red-500/10"
                            >
                              <XCircle className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;