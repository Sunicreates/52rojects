
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Clock, Github, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WeekGridProps {
  projects: any[];
  onWeekClick: (week: number) => void;
}

export const WeekGrid = ({ projects, onWeekClick }: WeekGridProps) => {
  const weeks = Array.from({ length: 52 }, (_, i) => i + 1);

  const getWeekProject = (week: number) => {
    return projects.find(p => p.week === week);
  };

  const getWeekStatus = (week: number) => {
    const project = getWeekProject(week);
    if (!project) return 'empty';
    return project.status === 'Approved' ? 'completed' : 'pending';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'border-green-500 bg-green-500/20';
      case 'pending': return 'border-yellow-500 bg-yellow-500/20';
      default: return 'border-gray-600 bg-gray-800 hover:border-green-500/50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-5 w-5 text-green-400" />;
      case 'pending': return <Clock className="h-5 w-5 text-yellow-400" />;
      default: return <Plus className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="grid grid-cols-13 gap-2">
      {weeks.map(week => {
        const project = getWeekProject(week);
        const status = getWeekStatus(week);
        
        return (
          <Card 
            key={week} 
            className={`${getStatusColor(status)} cursor-pointer transition-all hover:scale-105 relative group`}
            onClick={() => onWeekClick(week)}
          >
            <CardContent className="p-3 text-center">
              <div className="text-xs text-gray-400 mb-1">W{week}</div>
              {getStatusIcon(status)}
              
              {project && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <div className="bg-gray-700 text-white text-xs rounded p-2 whitespace-nowrap shadow-lg border border-green-500/20">
                    <div className="font-semibold">{project.title}</div>
                    <div className="text-gray-300">{project.status}</div>
                    {project.githubRepo && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-1 h-6 px-2 text-xs border-green-500/30"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(project.githubRepo, '_blank');
                        }}
                      >
                        <Github className="h-3 w-3 mr-1" />
                        View Repo
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
