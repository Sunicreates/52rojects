
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Github, Calendar, FileText, Link } from 'lucide-react';
import { toast } from 'sonner';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  selectedWeek?: number | null;
}

export const ProjectModal = ({ isOpen, onClose, onSubmit, selectedWeek }: ProjectModalProps) => {
  const [title, setTitle] = useState('');
  const [githubRepo, setGithubRepo] = useState('');
  const [description, setDescription] = useState('');
  const [week, setWeek] = useState('');

  useEffect(() => {
    if (selectedWeek) {
      setWeek(selectedWeek.toString());
    }
  }, [selectedWeek]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !githubRepo || !week) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate GitHub URL
    const githubUrlPattern = /^https:\/\/github\.com\/[\w-]+\/[\w-]+\/?$/;
    if (!githubUrlPattern.test(githubRepo)) {
      toast.error('Please enter a valid GitHub repository URL');
      return;
    }

    onSubmit({
      title,
      githubRepo,
      description,
      week: parseInt(week)
    });

    // Reset form
    setTitle('');
    setGithubRepo('');
    setDescription('');
    setWeek('');
  };

  const weeks = Array.from({ length: 52 }, (_, i) => i + 1);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-green-500/20 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-green-400">
            Add New Project
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-green-400">
              <FileText className="inline h-4 w-4 mr-2" />
              Project Title *
            </Label>
            <Input
              id="title"
              type="text"
              placeholder="My Awesome Project"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-gray-700 border-green-500/30 text-white placeholder:text-gray-400"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="githubRepo" className="text-green-400">
              <Github className="inline h-4 w-4 mr-2" />
              GitHub Repository URL *
            </Label>
            <Input
              id="githubRepo"
              type="url"
              placeholder="https://github.com/username/project"
              value={githubRepo}
              onChange={(e) => setGithubRepo(e.target.value)}
              className="bg-gray-700 border-green-500/30 text-white placeholder:text-gray-400"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="week" className="text-green-400">
              <Calendar className="inline h-4 w-4 mr-2" />
              Week Number *
            </Label>
            <Select value={week} onValueChange={setWeek}>
              <SelectTrigger className="bg-gray-700 border-green-500/30 text-white">
                <SelectValue placeholder="Select week" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-green-500/30">
                {weeks.map(weekNum => (
                  <SelectItem key={weekNum} value={weekNum.toString()}>
                    Week {weekNum}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description" className="text-green-400">
              <FileText className="inline h-4 w-4 mr-2" />
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Describe your project..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-gray-700 border-green-500/30 text-white placeholder:text-gray-400 resize-none"
              rows={3}
            />
          </div>
          
          <div className="flex space-x-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="flex-1 border-gray-500 text-gray-300 hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-green-500 text-black hover:bg-green-400"
            >
              Submit Project
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
