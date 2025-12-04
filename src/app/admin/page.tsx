'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Project, Skill, 
  getProjects, createProject, updateProject, deleteProject,
  getSkills, createSkill, updateSkill, deleteSkill,
  uploadFile 
} from '@/lib/api';
import { Plus, Edit, Trash2, Save, X, Eye, EyeOff, Upload, Loader2 } from 'lucide-react';

// Tabs component
const Tabs = ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (tab: string) => void }) => (
  <div className="flex space-x-4 border-b border-neutral-200 dark:border-neutral-800 mb-8">
    <button
      className={`pb-2 px-4 font-medium transition-colors ${
        activeTab === 'projects'
          ? 'text-accent-blue border-b-2 border-accent-blue'
          : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
      }`}
      onClick={() => setActiveTab('projects')}
    >
      Projects
    </button>
    <button
      className={`pb-2 px-4 font-medium transition-colors ${
        activeTab === 'skills'
          ? 'text-accent-blue border-b-2 border-accent-blue'
          : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
      }`}
      onClick={() => setActiveTab('skills')}
    >
      Skills
    </button>
  </div>
);

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('projects');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();

  // Check auth status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/check');
      if (res.ok) {
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    }
  };

  // Projects State
  const [projects, setProjects] = useState<Project[]>([]);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  
  // Skills State
  const [skills, setSkills] = useState<Skill[]>([]);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    const projectsData = await getProjects();
    setProjects(projectsData);
    
    const skillsData = await getSkills();
    setSkills(skillsData);
  };

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/request-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (res.ok) {
        setStep('verify');
      } else {
        alert('Failed to request code');
      }
    } catch (error) {
      console.error('Request code error:', error);
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      
      if (res.ok) {
        setIsAuthenticated(true);
      } else {
        alert('Invalid code');
      }
    } catch (error) {
      console.error('Verify code error:', error);
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setIsAuthenticated(false);
      setStep('request');
      setCode('');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <div className="bg-white dark:bg-neutral-900 p-8 rounded-lg shadow-lg max-w-md w-full">
          <h1 className="text-2xl font-bold mb-6 text-center">Admin Login</h1>
          
          {step === 'request' ? (
            <form onSubmit={handleRequestCode} className="space-y-4">
              <div className="text-center mb-6 text-neutral-600 dark:text-neutral-400">
                <p>Click the button below to send a secure login code to your configured admin email address.</p>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-accent-blue text-white py-2 rounded hover:bg-accent-blue-dark transition-colors disabled:opacity-50"
              >
                {loading ? 'Sending Code...' : 'Send Login Code'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Verification Code</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full p-2 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-center text-2xl tracking-widest"
                  required
                  placeholder="123456"
                  maxLength={6}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-accent-blue text-white py-2 rounded hover:bg-accent-blue-dark transition-colors disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Login'}
              </button>
              <button
                type="button"
                onClick={() => setStep('request')}
                className="w-full text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
              >
                Back to Request
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 pt-24 pb-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Portfolio Admin</h1>
          <button
            onClick={handleLogout}
            className="text-red-500 hover:text-red-600 font-medium"
          >
            Logout
          </button>
        </div>

        <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

        {activeTab === 'projects' ? (
          <ProjectsManager projects={projects} setProjects={setProjects} />
        ) : (
          <SkillsManager skills={skills} setSkills={setSkills} />
        )}
      </div>
    </div>
  );
}

function ProjectsManager({ projects, setProjects }: { projects: Project[], setProjects: any }) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Project>>({});
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (formData.id) {
        const updated = await updateProject(formData.id, formData);
        setProjects(projects.map(p => p.id === updated.id ? updated : p));
      } else {
        const newProject = await createProject(formData as Omit<Project, 'id' | 'createdAt' | 'updatedAt'>);
        setProjects([...projects, newProject]);
      }
      setIsFormOpen(false);
    } catch (error) {
      console.error('Failed to save project:', error);
      alert('Failed to save project. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    
    try {
      await deleteProject(id);
      setProjects(projects.filter(p => p.id !== id));
    } catch (error) {
      console.error('Failed to delete project:', error);
      alert('Failed to delete project. Please try again.');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const url = await uploadFile(file);
      const currentImages = formData.imageUrls || [];
      setFormData({
        ...formData,
        imageUrls: [...currentImages, url]
      });
    } catch (error) {
      console.error('Failed to upload file:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (indexToRemove: number) => {
    const currentImages = formData.imageUrls || [];
    setFormData({
      ...formData,
      imageUrls: currentImages.filter((_, index) => index !== indexToRemove)
    });
  };

  return (
    <div>
      <div className="flex justify-between mb-6">
        <h2 className="text-xl font-semibold">Projects ({projects.length})</h2>
        <button
          onClick={() => {
            setFormData({});
            setIsFormOpen(true);
          }}
          className="flex items-center px-4 py-2 bg-accent-green text-white rounded hover:bg-accent-green-dark transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Project
        </button>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">{formData.id ? 'Edit Project' : 'New Project'}</h3>
              <button onClick={() => setIsFormOpen(false)}><X className="w-6 h-6" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input
                    value={formData.title || ''}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    className="w-full p-2 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Project URL</label>
                  <input
                    value={formData.projectUrl || ''}
                    onChange={e => setFormData({...formData, projectUrl: e.target.value})}
                    className="w-full p-2 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Short Description</label>
                <textarea
                  value={formData.description || ''}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full p-2 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent h-20"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Full Description</label>
                <textarea
                  value={formData.fullDescription || ''}
                  onChange={e => setFormData({...formData, fullDescription: e.target.value})}
                  className="w-full p-2 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent h-32"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Technologies (comma separated)</label>
                <input
                  value={formData.technologies?.join(', ') || ''}
                  onChange={e => setFormData({...formData, technologies: e.target.value.split(',').map(t => t.trim())})}
                  className="w-full p-2 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Project Images</label>
                <div className="grid grid-cols-4 gap-4 mb-4">
                  {formData.imageUrls?.map((url, index) => (
                    <div key={index} className="relative group aspect-video bg-neutral-100 dark:bg-neutral-800 rounded overflow-hidden">
                      <img src={url} alt={`Project image ${index + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <label className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded flex flex-col items-center justify-center p-4 cursor-pointer hover:border-accent-blue transition-colors aspect-video">
                    {isUploading ? (
                      <Loader2 className="w-6 h-6 animate-spin text-accent-blue" />
                    ) : (
                      <>
                        <Upload className="w-6 h-6 text-neutral-400 mb-2" />
                        <span className="text-xs text-neutral-500">Upload Image</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </label>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.featured || false}
                  onChange={e => setFormData({...formData, featured: e.target.checked})}
                  className="w-4 h-4"
                />
                <label className="text-sm font-medium">Featured Project</label>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  className="px-6 py-2 bg-accent-blue text-white rounded hover:bg-accent-blue-dark"
                >
                  Save Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {projects.map(project => (
          <div key={project.id} className="bg-white dark:bg-neutral-900 p-4 rounded-lg shadow flex justify-between items-center">
            <div>
              <h3 className="font-semibold">{project.title}</h3>
              <p className="text-sm text-neutral-500">{project.description}</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  setFormData(project);
                  setIsFormOpen(true);
                }}
                className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded"
              >
                <Edit className="w-4 h-4 text-blue-500" />
              </button>
              <button 
                onClick={() => handleDelete(project.id)}
                className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SkillsManager({ skills, setSkills }: { skills: Skill[], setSkills: any }) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Skill>>({});
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (formData.id) {
        const updated = await updateSkill(formData.id, formData);
        setSkills(skills.map(s => s.id === updated.id ? updated : s));
      } else {
        const newSkill = await createSkill(formData as Omit<Skill, 'id'>);
        setSkills([...skills, newSkill]);
      }
      setIsFormOpen(false);
    } catch (error) {
      console.error('Failed to save skill:', error);
      alert('Failed to save skill. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this skill?')) return;
    
    try {
      await deleteSkill(id);
      setSkills(skills.filter(s => s.id !== id));
    } catch (error) {
      console.error('Failed to delete skill:', error);
      alert('Failed to delete skill. Please try again.');
    }
  };

  const toggleVisibility = async (skill: Skill) => {
    try {
      const updated = await updateSkill(skill.id, { visible: !skill.visible });
      setSkills(skills.map(s => s.id === updated.id ? updated : s));
    } catch (error) {
      console.error('Failed to toggle skill visibility:', error);
      alert('Failed to toggle skill visibility. Please try again.');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const url = await uploadFile(file, 'skills');
      setFormData({
        ...formData,
        icon: url
      });
    } catch (error) {
      console.error('Failed to upload file:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between mb-6">
        <h2 className="text-xl font-semibold">Skills ({skills.length})</h2>
        <button
          onClick={() => {
            setFormData({ visible: true, proficiency: 50 });
            setIsFormOpen(true);
          }}
          className="flex items-center px-4 py-2 bg-accent-green text-white rounded hover:bg-accent-green-dark transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Skill
        </button>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">{formData.id ? 'Edit Skill' : 'New Skill'}</h3>
              <button onClick={() => setIsFormOpen(false)}><X className="w-6 h-6" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Skill Name</label>
                <input
                  value={formData.name || ''}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full p-2 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  value={formData.category || 'frontend'}
                  onChange={e => setFormData({...formData, category: e.target.value as any})}
                  className="w-full p-2 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                >
                  <option value="frontend">Frontend</option>
                  <option value="backend">Backend</option>
                  <option value="database">Database</option>
                  <option value="tools">Tools</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Proficiency ({formData.proficiency}%)</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.proficiency || 50}
                  onChange={e => setFormData({...formData, proficiency: parseInt(e.target.value)})}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Icon / Image</label>
                <div className="flex items-center gap-4">
                  {formData.icon && (
                    <div className="relative w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded flex items-center justify-center overflow-hidden">
                      {formData.icon.startsWith('/') || formData.icon.startsWith('http') ? (
                        <img src={formData.icon} alt="Skill icon" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-lg font-bold">{formData.icon.substring(0, 2)}</span>
                      )}
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <input
                      value={formData.icon || ''}
                      onChange={e => setFormData({...formData, icon: e.target.value})}
                      className="w-full p-2 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent mb-2"
                      placeholder="e.g., react, database, or http://..."
                    />
                    
                    <label className="flex items-center justify-center p-2 border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded cursor-pointer hover:border-accent-blue transition-colors">
                      {isUploading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-accent-blue mr-2" />
                      ) : (
                        <Upload className="w-4 h-4 text-neutral-400 mr-2" />
                      )}
                      <span className="text-sm text-neutral-500">Upload Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        disabled={isUploading}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.visible !== false}
                  onChange={e => setFormData({...formData, visible: e.target.checked})}
                  className="w-4 h-4"
                />
                <label className="text-sm font-medium">Visible in Portfolio</label>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  className="px-6 py-2 bg-accent-blue text-white rounded hover:bg-accent-blue-dark"
                >
                  Save Skill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {skills.map(skill => (
          <div key={skill.id} className={`bg-white dark:bg-neutral-900 p-4 rounded-lg shadow flex justify-between items-center ${!skill.visible ? 'opacity-60' : ''}`}>
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-neutral-100 dark:bg-neutral-800 rounded flex items-center justify-center overflow-hidden">
                {skill.icon && (skill.icon.startsWith('/') || skill.icon.startsWith('http')) ? (
                  <img src={skill.icon} alt={skill.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-bold">{skill.icon?.substring(0, 2) || skill.name.substring(0, 2)}</span>
                )}
              </div>
              <div>
                <h3 className="font-semibold">{skill.name}</h3>
                <p className="text-xs text-neutral-500 uppercase">{skill.category}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={() => toggleVisibility(skill)}
                className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded"
              >
                {skill.visible ? (
                  <Eye className="w-4 h-4 text-green-500" />
                ) : (
                  <EyeOff className="w-4 h-4 text-neutral-400" />
                )}
              </button>
              <button
                onClick={() => {
                  setFormData(skill);
                  setIsFormOpen(true);
                }}
                className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded"
              >
                <Edit className="w-4 h-4 text-blue-500" />
              </button>
              <button 
                onClick={() => handleDelete(skill.id)}
                className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
