import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  X,
  Trophy,
  Flame,
  GitBranch,
  Code2,
  Activity,
  ChevronRight,
  TrendingUp,
  Calendar,
  Layers,
  ArrowRight,
  ExternalLink,
  Plus,
  AlertCircle,
  Camera,
  Trash2,
  LayoutDashboard,
  Clock,
  ChevronLeft,
  Sparkles,
  Bookmark,
  Info,
  Star,
  GitBranch as GithubIcon,
  Users,
  Eye,
  GitFork,
  Book,
  Award,
  PieChart,
  Box,
  Zap,
  Crown,
  Code,
  Package,
  Terminal,
  BookOpen,
  Lock,
  CheckCircle,
  Monitor,
  RotateCcw,
  AlertTriangle,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RePieChart, Pie, Cell
} from 'recharts';
import {
  getCurrentUser,
  updateCurrentUser,
  getActivityHeatmap,
  getLeaderboard,
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  getAvailableSkills,
  getUserSkills,
  addUserSkill,
  updateUserSkill,
  deleteUserSkill,
  getGithubProfile,
  getGithubRepos,
  getGithubActivity,
  getActivityHub,
  getDashboardAnalytics,
  toggleShowcaseBadge,
  getPublicProfile
} from "../../services/dashboardService";
import { deleteAccount, resetAccountData } from "../../services/authService";
import { useApiResource } from "../../hooks/useApiResource";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import GlassCard from "../../components/common/GlassCard";
import Skeleton from "../../components/ui/Skeleton";
import DashboardLayout from "../../layouts/DashboardLayout";
import { logout as clearSession } from "../../utils/auth";
import ImageCropper from "../../components/common/ImageCropper";

// Custom Confirmation Modal Component
const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel, isLoading }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-rise-in">
      <div className="w-full max-w-md">
        <GlassCard className="p-6 border-white/10 shadow-2xl">
          <div className="flex items-center gap-3 text-red-400 mb-4">
            <AlertCircle size={24} />
            <h2 className="text-xl font-black text-[#f8f6f3]">{title}</h2>
          </div>
          <p className="text-sm text-[#8d807c] mb-8 leading-relaxed">{message}</p>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={onCancel} disabled={isLoading}>Cancel</Button>
            <Button variant="danger" onClick={onConfirm} isLoading={isLoading}>Confirm Deletion</Button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

const SkillHoursControl = ({ skillId, onUpdate }) => {
  const timerRef = useRef(null);
  const fastTimerRef = useRef(null);
  const onUpdateRef = useRef(onUpdate);

  // Sync ref with latest prop
  onUpdateRef.current = onUpdate;

  const startPress = (e, type) => {
    if (e.button !== 0 && !e.touches) return; // Only left click or touch
    e.stopPropagation();
    
    onUpdateRef.current(skillId, type === 'inc' ? 1 : -1);
    
    timerRef.current = setTimeout(() => {
      fastTimerRef.current = setInterval(() => {
        onUpdateRef.current(skillId, type === 'inc' ? 1 : -1);
      }, 80);
    }, 400);
  };

  const stopPress = (e) => {
    if (e) e.stopPropagation();
    clearTimeout(timerRef.current);
    clearInterval(fastTimerRef.current);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onMouseDown={(e) => startPress(e, 'dec')}
        onMouseUp={stopPress}
        onMouseLeave={stopPress}
        onTouchStart={(e) => startPress(e, 'dec')}
        onTouchEnd={stopPress}
        onClick={(e) => e.stopPropagation()}
        className="h-8 w-8 rounded-lg bg-white/[0.05] flex items-center justify-center text-[#8d807c] hover:bg-red-400/20 hover:text-red-400 transition-all select-none font-bold active:scale-95"
      >
        -
      </button>
      <button
        onMouseDown={(e) => startPress(e, 'inc')}
        onMouseUp={stopPress}
        onMouseLeave={stopPress}
        onTouchStart={(e) => startPress(e, 'inc')}
        onTouchEnd={stopPress}
        onClick={(e) => e.stopPropagation()}
        className="h-8 w-8 rounded-lg bg-white/[0.05] flex items-center justify-center text-[#edc390] hover:bg-[#edc390] hover:text-[#1d1917] transition-all select-none font-bold active:scale-95"
      >
        +
      </button>
    </div>
  );
};

function DashboardPage() {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState("overview");

  const userResource = useApiResource(getCurrentUser);
  const currentUser = userResource.data || {};

  const heatmapResource = useApiResource(getActivityHeatmap);
  const leaderboardResource = useApiResource(getLeaderboard);
  const projectsResource = useApiResource(getProjects);
  const userSkillsResource = useApiResource(getUserSkills);
  const dashboardResource = useApiResource(getDashboardAnalytics);

  // GitHub Workspace resources
  const githubProfileResource = useApiResource(getGithubProfile);
  const githubReposResource = useApiResource(getGithubRepos);
  const githubActivityResource = useApiResource(getGithubActivity);

  const [showProfile, setShowProfile] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);

  // Profile Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bio, setBio] = useState("");
  const [githubUsername, setGithubUsername] = useState("");
  const [collegeName, setCollegeName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Cropper states
  const [imageToCrop, setImageToCrop] = useState(null);
  const [showCropper, setShowCropper] = useState(false);

  // Success Toast states
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  // New Project states
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [projectTitle, setProjectTitle] = useState("");
  const [projectDesc, setProjectDesc] = useState("");
  const [projectTech, setProjectTech] = useState("");
  const [projectGithub, setProjectGithub] = useState("");
  const [projectStatus, setProjectStatus] = useState("PLANNING");
  const [projectDifficulty, setProjectDifficulty] = useState("BEGINNER");
  const [projectProgress, setProjectProgress] = useState(0);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [projectCreateError, setProjectCreateError] = useState(null);

  // Confirmation state
  const [confirmState, setConfirmState] = useState({ isOpen: false, type: null, id: null, title: "", message: "" });
  const [isDeleting, setIsDeleting] = useState(false);

  // Skills Workspace states
  const [showAddSkillModal, setShowAddSkillModal] = useState(false);
  const [skillInputName, setSkillInputName] = useState("");
  const [skillProficiency, setSkillProficiency] = useState("BEGINNER");
  const [skillInitialHours, setSkillInitialHours] = useState("");
  const [skillDescription, setSkillDescription] = useState("");
  const [skillCategory, setSkillCategory] = useState("");
  const [skillStartedDate, setSkillStartedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [skillError, setSkillError] = useState(null);

  const [selectedSkill, setSelectedSkill] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isEditingProjectModal, setIsEditingProjectModal] = useState(false);
  const [activityHubData, setActivityHubData] = useState(null);
  const [isActivityLoading, setIsActivityLoading] = useState(false);
  const [selectedDayIndex, setSelectedDayIndex] = useState(14); // Default to today (last of 15 days)
  const [isFeaturingBadge, setIsFeaturingBadge] = useState(false);
  const [isTogglingShowcase, setIsTogglingShowcase] = useState(false);
  const [selectedBadgeDetails, setSelectedBadgeDetails] = useState(null);
  const [selectedProfilePreview, setSelectedProfilePreview] = useState(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [leaderboardTab, setLeaderboardTab] = useState("global");
  const [intensityRange, setIntensityRange] = useState("today");

  // Danger Zone states
  const [showDangerModal, setShowDangerModal] = useState(false);
  const [dangerAction, setDangerAction] = useState(null); // 'delete' | 'reset'
  const [dangerPassword, setDangerPassword] = useState("");
  const [isDangerLoading, setIsDangerLoading] = useState(false);
  const [dangerError, setDangerError] = useState(null);

  const todayRef = useRef(null);

  useEffect(() => {
    if (showStreakModal && todayRef.current) {
      setTimeout(() => {
        todayRef.current.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }, 100);
    }
  }, [showStreakModal]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchActivityHub = async (isSilent = false) => {
    if (!isSilent) setIsActivityLoading(true);
    try {
      const data = await getActivityHub();
      setActivityHubData(data);
    } catch (err) {
      console.error("Failed to fetch activity hub", err);
    } finally {
      setIsActivityLoading(false);
    }
  };

  const fetchProfilePreview = async (username) => {
    if (!username) return;
    setIsPreviewLoading(true);
    try {
      const data = await getPublicProfile(username);
      setSelectedProfilePreview(data);
    } catch (err) {
      console.error("Failed to fetch profile preview", err);
      triggerToast("User narrative is currently private");
    } finally {
      setIsPreviewLoading(false);
    }
  };

  useEffect(() => {
    if (currentView === 'activity') {
      fetchActivityHub();
    }
  }, [currentView]);

  const handleFeatureBadge = async (badgeId) => {
    setIsFeaturingBadge(true);
    try {
      await setFeaturedBadge(badgeId);
      userResource.reload();
      fetchActivityHub();
    } catch (err) {
      console.error("Failed to feature badge", err);
    } finally {
      setIsFeaturingBadge(false);
    }
  };

  const handleToggleShowcase = async (badgeId) => {
    setIsTogglingShowcase(true);
    try {
      await toggleShowcaseBadge(badgeId);
      userResource.reload();
      dashboardResource.reload();
      fetchActivityHub();
    } catch (err) {
      console.error("Failed to toggle showcase", err);
    } finally {
      setIsTogglingShowcase(false);
    }
  };

  const fileInputRef = useRef(null);

  useEffect(() => {
    // Hide scrollbars for specific containers
    const style = document.createElement('style');
    style.innerHTML = `
      .hide-scrollbar {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
      .hide-scrollbar::-webkit-scrollbar {
        display: none;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  useEffect(() => {
    if (currentUser?.avatar_base64) {
      setAvatarUrl(currentUser.avatar_base64);
    } else {
      setAvatarUrl(null);
    }
  }, [currentUser?.avatar_base64]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageToCrop(reader.result);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
      // Reset input value so same file can be selected again
      e.target.value = "";
    }
  };

  const handleCropComplete = (croppedImage) => {
    setAvatarUrl(croppedImage);
    setShowCropper(false);
    setImageToCrop(null);
  };

  const handleRemovePhoto = () => {
    setAvatarUrl(null);
  };

  const handleStartEdit = () => {
    setFirstName(currentUser?.first_name || "");
    setLastName(currentUser?.last_name || "");
    setBio(currentUser?.bio || "");
    setGithubUsername(currentUser?.github_username || "");
    setCollegeName(currentUser?.college_name || "");
    setIsEditing(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();

    // Mandatory Field Validation
    if (!firstName) return triggerToast("First Name Required");

    setIsSaving(true);
    try {
      const sanitizeGithub = (val) => {
        if (!val) return "";
        return val.trim().replace(/\/+$/, '').split('/').pop().split('?')[0];
      };

      await updateCurrentUser({
        first_name: firstName,
        last_name: lastName,
        bio,
        github_username: sanitizeGithub(githubUsername),
        college_name: collegeName,
        avatar_base64: avatarUrl,
      });
      await userResource.reload();
      githubProfileResource.reload();
      githubReposResource.reload();
      githubActivityResource.reload();
      dashboardResource.reload();

      setIsEditing(false);
      triggerToast("Profile Updated");
    } catch (err) {
      console.error("Save failed");
      triggerToast("Update Failed - Check Input");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();

    // Mandatory Field Validation
    if (!projectTitle) return triggerToast("Project Title Required");

    setIsCreatingProject(true);
    setProjectCreateError(null);
    try {
      const payload = {
        title: projectTitle,
        description: projectDesc || "No description provided.",
        tech_stack: projectTech,
        status: projectStatus,
        difficulty: projectDifficulty,
        progress_percentage: projectStatus === "COMPLETED" ? 100 : (projectStatus === "IN_PROGRESS" ? 50 : 0)
      };
      if (projectGithub.trim()) {
        payload.github_url = projectGithub.trim();
      }
      await createProject(payload);
      await projectsResource.reload();
      await userResource.reload();
      setShowNewProjectModal(false);
      setProjectTitle("");
      setProjectDesc("");
      setProjectTech("");
      setProjectGithub("");
      triggerToast("Narrative Initialized");
    } catch (err) {
      const errorMsg = err.response?.data?.github_url?.[0] || err.response?.data?.error || "Initialization Failed.";
      setProjectCreateError(errorMsg);
      triggerToast(errorMsg);
    } finally {
      setIsCreatingProject(false);
    }
  };

  const handleImportRepo = (repo) => {
    // Check if repo already exists in projects
    const exists = projectsResource.data?.some(p => 
      p.github_url?.toLowerCase().replace(/\/+$/, '') === repo.html_url?.toLowerCase().replace(/\/+$/, '')
    );

    if (exists) {
      return triggerToast("Project already imported from this repository.");
    }

    setProjectTitle(repo.name);
    setProjectDesc(repo.description || "");
    setProjectGithub(repo.html_url);
    setProjectTech(repo.language || "");
    setProjectStatus("IN_PROGRESS");
    setProjectDifficulty("INTERMEDIATE");
    setShowNewProjectModal(true);
  };

  const handleUpdateProject = async (e) => {
    if (e) e.preventDefault();
    setIsCreatingProject(true);
    try {
      await updateProject(selectedProject.id, {
        title: projectTitle,
        description: projectDesc,
        github_url: projectGithub,
        tech_stack: projectTech,
        status: projectStatus,
        difficulty: projectDifficulty,
        progress_percentage: parseInt(projectProgress || 0)
      });
      await projectsResource.reload();
      setSelectedProject(null);
      setIsEditingProjectModal(false);
    } catch (err) {
      console.error("Update failed");
    } finally {
      setIsCreatingProject(false);
    }
  };

  const handleToggleStarProject = async (e, projectId, currentStarred) => {
    e.stopPropagation();
    
    // OPTIMISTIC UPDATE
    const originalData = [...(projectsResource.data || [])];
    const updatedData = originalData.map(p => 
      p.id === projectId ? { ...p, is_starred: !currentStarred } : p
    );
    projectsResource.mutate(updatedData);

    try {
      await updateProject(projectId, { is_starred: !currentStarred });
      // Silent refresh to sync with server
      await projectsResource.reload(true);
      dashboardResource.reload(true);
    } catch (err) {
      // Rollback
      projectsResource.mutate(originalData);
      console.error("Failed to toggle star");
      triggerToast("Update Failed");
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!skillInputName.trim()) return triggerToast("Skill Name Required");
    setIsAddingSkill(true);
    setSkillError(null);
    try {
      await addUserSkill({
        skill_name: skillInputName.trim(),
        proficiency: skillProficiency,
        hours_practiced: parseInt(skillInitialHours) || 0,
        description: skillDescription,
        category: skillCategory,
        started_learning_date: skillStartedDate
      });

      // DEEP SYNC: All resources that depend on skill data
      await userSkillsResource.reload();
      await userResource.reload();
      await githubActivityResource.reload();
      await fetchActivityHub();
      await dashboardResource.reload();

      setShowAddSkillModal(false);
      setSkillInputName("");
      setSkillInitialHours("");
      setSkillDescription("");
      setSkillCategory("");
      setSkillStartedDate(new Date().toISOString().split('T')[0]);
      triggerToast("Skill Workspace Synchronized");
    } catch (err) {
      setSkillError("Failed to add skill.");
      triggerToast("Skill Sync Failed");
    } finally {
      setIsAddingSkill(false);
    }
  };

  // Debounced Sync for Skills
  const skillSyncTimers = useRef({});
  const handleUpdatePracticeHours = (skillId, amount = 1) => {
    let finalHours = 0;
    
    // 1. OPTIMISTIC UPDATE (Functional)
    userSkillsResource.mutate(prevSkills => {
      const skills = prevSkills || [];
      const skillToUpdate = skills.find(s => s.id === skillId);
      if (!skillToUpdate) return skills;
      
      finalHours = Math.max(0, (skillToUpdate.hours_practiced || 0) + amount);
      return skills.map(skill =>
        skill.id === skillId ? { ...skill, hours_practiced: finalHours } : skill
      );
    });

    // 2. DEBOUNCED BACKEND SYNC
    if (skillSyncTimers.current[skillId]) {
      clearTimeout(skillSyncTimers.current[skillId]);
    }
    
    skillSyncTimers.current[skillId] = setTimeout(async () => {
      try {
        await updateUserSkill(skillId, { hours_practiced: finalHours });
        userSkillsResource.reload(true);
        userResource.reload(true);
        fetchActivityHub(true);
      } catch (err) {
        triggerToast("Sync Failed");
        userSkillsResource.reload(); // Hard refresh to fix state
      }
    }, 1000); // Wait for 1s of inactivity before syncing
  };

  const triggerDelete = (e, type, id, title) => {
    e.stopPropagation();
    setConfirmState({
      isOpen: true,
      type,
      id,
      title: `Delete ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      message: `Are you sure you want to permanently retire "${title}"? This action will negate your current DevScore accordingly.`
    });
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      if (confirmState.type === "skill") {
        await deleteUserSkill(confirmState.id);
        await userSkillsResource.reload();
        if (selectedSkill?.id === confirmState.id) setSelectedSkill(null);
      } else {
        await deleteProject(confirmState.id);
        await projectsResource.reload();
      }
      await userResource.reload();
      await fetchActivityHub(); // Sync effort allocation on delete
      setConfirmState({ ...confirmState, isOpen: false });
      triggerToast(`${confirmState.type.charAt(0).toUpperCase() + confirmState.type.slice(1)} Retired`);
    } catch (err) {
      console.error("Deletion failed");
      triggerToast("Action Failed");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLogout = () => {
    clearSession();
    navigate("/");
  };

  const handleDangerAction = async (e) => {
    e.preventDefault();
    setDangerError(null);
    setIsDangerLoading(true);
    try {
      if (dangerAction === 'delete') {
        await deleteAccount(dangerPassword);
        handleLogout();
      } else {
        await resetAccountData(dangerPassword);
        setShowDangerModal(false);
        setDangerPassword("");
        userResource.reload();
        dashboardResource.reload();
        if (currentView === 'activity') fetchActivityHub();
      }
    } catch (err) {
      setDangerError(err.response?.data?.error || "Action failed. Check password.");
    } finally {
      setIsDangerLoading(false);
    }
  };


  const fullNameDisplay = [currentUser?.first_name, currentUser?.last_name]
    .filter(Boolean)
    .join(" ");

  // Helper: Calculate Experience
  const calculateExperience = (startDateStr) => {
    if (!startDateStr) return "0 Days";
    const start = new Date(startDateStr);
    const today = new Date();
    const diffTime = Math.abs(today - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 30) return `${diffDays} Days`;
    if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} ${months === 1 ? 'Month' : 'Months'}`;
    }
    const years = (diffDays / 365).toFixed(1);
    return `${years} ${parseFloat(years) === 1 ? 'Year' : 'Years'}`;
  };

  // Helper: Count projects for a skill
  const getProjectCountForSkill = (skillName) => {
    if (!projectsResource.data || !skillName) return 0;
    return projectsResource.data.filter(project => {
      if (!project.tech_stack) return false;
      const tech = project.tech_stack.toLowerCase().split(/[ ,./]+/).map(t => t.trim());
      return tech.includes(skillName.toLowerCase());
    }).length;
  };

  const heatmapData = useMemo(() => {
    if (!heatmapResource.data) return [];
    const activityMap = {};
    heatmapResource.data.forEach(item => activityMap[item.date] = item.count);
    const days = [];
    const today = new Date();
    for (let i = 167; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      days.push({ date: dateStr, count: activityMap[dateStr] || 0 });
    }
    return days;
  }, [heatmapResource.data]);

  const getHeatmapColor = (count) => {
    if (count === 0) return "bg-white/[0.03]";
    if (count < 2) return "bg-[#edc390]/30";
    if (count < 5) return "bg-[#edc390]/60";
    return "bg-[#e7380d]";
  };

  const activityStats = useMemo(() => {
    if (!heatmapResource.data) return { total: 0, peak: 0 };
    const counts = heatmapResource.data.map(d => d.count);
    const total = counts.reduce((a, b) => a + b, 0);
    const peak = counts.length > 0 ? Math.max(...counts) : 0;
    return { total, peak };
  }, [heatmapResource.data]);

  const projectCardsStarred = useMemo(() => {
    if (!projectsResource.data) return [];
    const starred = projectsResource.data.filter(p => p.is_starred);
    if (starred.length === 0) return [];

    return starred.map((project) => (
      <GlassCard key={project.id} className="w-[340px] shrink-0 p-6 group hover:border-[#edc390]/30 transition-all select-none relative overflow-hidden">
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-bold text-[#f8f6f3] group-hover:text-[#edc390] truncate pr-2 text-base flex-1 transition-colors">{project.title}</h3>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.03] text-[#8d807c] font-black tracking-widest uppercase shrink-0">
            {project.status}
          </span>
        </div>
        <p className="text-xs text-[#8d807c] line-clamp-2 h-9 leading-relaxed">{project.description}</p>
        <div className="mt-6 flex items-center gap-4">
          <div className="flex-1 h-2 bg-white/[0.03] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#e7380d] to-[#edc390]" style={{ width: `${project.progress_percentage}%` }} />
          </div>
          <span className="text-[10px] font-black text-[#8d807c] pr-2">{project.progress_percentage}%</span>
          <button
            onClick={(e) => triggerDelete(e, "project", project.id, project.title)}
            className="p-1.5 text-white/5 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all duration-300"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </GlassCard>
    ));
  }, [projectsResource.data]);

  const renderOverview = () => (
    <div className="space-y-10 animate-rise-in">
      <div className="grid gap-4 sm:grid-cols-3">
        <GlassCard className="p-5 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 group">
          <div className="flex items-center justify-between"><span className="text-xs font-semibold uppercase tracking-wider text-[#8d807c]">DevScore</span><div className="rounded-full bg-[#edc390]/10 p-2 text-[#edc390]"><Trophy size={18} /></div></div>
          <p className="mt-4 text-3xl font-black text-[#f8f6f3]">{currentUser?.depth_score || 0}</p>
        </GlassCard>
        <GlassCard
          onClick={() => setCurrentView('skills')}
          className="p-5 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 group cursor-pointer hover:bg-white/[0.05] hover:border-[#e7380d]/20"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#8d807c]">Verified Skills</span>
            <div className="rounded-full bg-[#e7380d]/10 p-2 text-[#e7380d] group-hover:scale-110 transition-transform"><Activity size={18} /></div>
          </div>
          <p className="mt-4 text-3xl font-black text-[#f8f6f3]">{currentUser?.skills_count || 0}</p>
        </GlassCard>

        <GlassCard
          onClick={() => setCurrentView('projects')}
          className="p-5 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 group cursor-pointer hover:bg-white/[0.05] hover:border-[#c66b3b]/20"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#8d807c]">Active Projects</span>
            <div className="rounded-full bg-[#c66b3b]/10 p-2 text-[#c66b3b] group-hover:scale-110 transition-transform"><Code2 size={18} /></div>
          </div>
          <p className="mt-4 text-3xl font-black text-[#f8f6f3]">{currentUser?.projects_count || 0}</p>
        </GlassCard>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-black text-[#f8f6f3] flex items-center gap-2">
          <Star size={20} className="text-[#edc390]" />
          Achievement Gallery
        </h2>
        <GlassCard className="p-6 border-white/5 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-5 -rotate-12 group-hover:rotate-0 transition-transform duration-700">
            <Trophy size={80} />
          </div>
          <div className="flex items-center justify-between gap-8 relative z-10">
            <div className="flex gap-8 overflow-x-auto hide-scrollbar py-2 flex-1">
              {dashboardResource.data?.showcased_badges?.map((ub, i) => (
                <div key={i} className="flex items-center gap-3 shrink-0 group/badge">
                  <div className="h-12 w-12 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center shadow-lg group-hover/badge:scale-110 group-hover/badge:border-[#edc390]/30 transition-all duration-500 relative">
                    {ub.badge.icon_name === 'Zap' && <Zap size={24} className="text-[#edc390]" />}
                    {ub.badge.icon_name === 'Layers' && <Layers size={24} className="text-[#edc390]" />}
                    {ub.badge.icon_name === 'Crown' && <Crown size={24} className="text-[#edc390]" />}
                    {ub.badge.icon_name === 'Flame' && <Flame size={24} className="text-[#e7380d]" />}
                    {ub.badge.icon_name === 'Trophy' && <Trophy size={24} className="text-[#edc390]" />}
                    {ub.badge.icon_name === 'Box' && <Box size={24} className="text-[#505b90]" />}
                    {ub.badge.icon_name === 'Sparkles' && <Sparkles size={24} className="text-[#edc390]" />}
                    {ub.badge.icon_name === 'Package' && <Package size={24} className="text-[#c66b3b]" />}
                    {ub.badge.icon_name === 'Terminal' && <Terminal size={24} className="text-green-400" />}
                    {ub.badge.icon_name === 'BookOpen' && <BookOpen size={24} className="text-[#505b90]" />}
                    {ub.badge.icon_name === 'GitBranch' && <GitBranch size={24} className="text-[#edc390]" />}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-[#f8f6f3] uppercase tracking-tighter">{ub.badge.name}</span>
                    <span className="text-[8px] font-black text-[#8d807c] uppercase tracking-widest">{ub.badge.rarity}</span>
                  </div>
                </div>
              ))}
              {(!dashboardResource.data?.showcased_badges || dashboardResource.data.showcased_badges.length === 0) && (
                <div className="flex items-center gap-4 opacity-30 py-2">
                  <Award size={20} />
                  <p className="text-[10px] font-black uppercase tracking-widest">Gallery Empty - Visit Activity Hub</p>
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              className="h-10 text-[10px] border border-white/5"
              onClick={() => setCurrentView('activity')}
            >
              Hub
            </Button>
          </div>
        </GlassCard>
      </div>

      <div className="space-y-4 overflow-hidden">
        <div className="flex items-center justify-between px-2">
          <div><h2 className="text-lg font-black text-[#f8f6f3] flex items-center gap-2"><Layers size={20} className="text-[#edc390]" /> Showcase Narrative</h2><p className="text-xs text-[#8d807c]">Your starred initiatives appearing on main telemetry.</p></div>
        </div>
        <div className="relative overflow-hidden">
          {projectsResource.isLoading ? <Skeleton className="h-32 w-full rounded-xl" /> :
            !projectsResource.data || projectsResource.data.filter(p => p.is_starred).length === 0 ? (
              <GlassCard className="p-12 text-center border-dashed border-white/10"><div className="flex flex-col items-center gap-4"><Star size={48} className="text-white/5" /><p className="text-[#f8f6f3] font-bold">No starred projects</p><p className="text-xs text-[#8d807c]">Star projects in the Project Workspace to show them here.</p><Button size="sm" onClick={() => setCurrentView("projects")} className="bg-white/5 text-[#f8f6f3]">Go to Projects</Button></div></GlassCard>
            ) : (
              <div className={`flex gap-6 ${projectsResource.data.filter(p => p.is_starred).length > 3 ? 'animate-marquee w-max will-change-transform py-4' : 'flex-wrap'}`}>
                {projectCardsStarred}{projectsResource.data.filter(p => p.is_starred).length > 3 && projectCardsStarred}
              </div>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-black text-[#f8f6f3] flex items-center gap-2"><Activity size={20} className="text-[#e7380d]" /> Velocity</h2>
          <GlassCard className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 grid grid-flow-col grid-rows-7 gap-1.5 overflow-x-auto custom-scrollbar">
                {heatmapData.map((day, idx) => <div key={idx} className={`h-3 w-3 rounded-sm ${getHeatmapColor(day.count)}`} />)}
              </div>
              <div className="w-full md:w-48 bg-white/[0.01] p-4 rounded-xl border border-white/5 space-y-4">
                <div className="flex justify-between items-end"><span className="text-[10px] font-black text-[#8d807c]">TOTAL</span><span className="text-lg font-black text-[#f8f6f3]">{activityStats.total}</span></div>
                <div className="flex justify-between items-end"><span className="text-[10px] font-black text-[#8d807c]">PEAK</span><span className="text-lg font-black text-[#f8f6f3]">{activityStats.peak}</span></div>
              </div>
            </div>
          </GlassCard>
        </div>
        <div className="space-y-4">
          <h2 className="text-lg font-black text-[#f8f6f3] flex items-center gap-2"><Trophy size={20} className="text-[#edc390]" /> Leaderboard</h2>
          <GlassCard className="overflow-hidden">
            <div className="divide-y divide-white/5">
              {leaderboardResource.data?.global?.slice(0, 5).map((entry, idx) => (
                <div
                  key={idx}
                  onClick={() => fetchProfilePreview(entry.username)}
                  className={`p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors ${entry.username === currentUser.username ? 'bg-[#edc390]/5' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-[#8d807c]">{entry.rank}</span>
                    <p className="text-sm font-bold text-[#f8f6f3]">{entry.username}</p>
                  </div>
                  <span className="text-sm font-black text-[#f8f6f3]">{entry.depth_score}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );

  const renderSkills = () => (
    <div className="space-y-8 animate-rise-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div><h2 className="text-2xl font-black text-[#f8f6f3] flex items-center gap-2"><Sparkles size={24} className="text-[#edc390]" /> Skills Workspace</h2><p className="text-sm text-[#8d807c]">Solidify foundations.</p></div>
        </div>
        <Button onClick={() => setShowAddSkillModal(true)} className="bg-[#e7380d] text-white">Add New Skill</Button>
      </div>
      {userSkillsResource.isLoading ? <Skeleton className="h-64 w-full rounded-2xl" /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {!userSkillsResource.data || userSkillsResource.data.length === 0 ? (
            <GlassCard className="col-span-full p-20 text-center flex flex-col items-center gap-6 border-dashed border-white/10"><Sparkles size={64} className="text-white/5" /><p className="text-[#f8f6f3] font-bold">Workspace empty</p><Button onClick={() => setShowAddSkillModal(true)}>Initialize Skill</Button></GlassCard>
          ) : (
            userSkillsResource.data.map((us) => (
              <GlassCard
                key={us.id}
                className="p-6 group hover:border-[#edc390]/20 transition-all cursor-pointer select-none"
                onClick={() => setSelectedSkill(us)}
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="space-y-1"><h3 className="text-lg font-black text-[#f8f6f3] group-hover:text-[#edc390]">{us.skill_name}</h3><div className="flex items-center gap-2"><span className="text-[10px] font-black text-[#e7380d]">{us.proficiency}</span></div></div>
                  <button onClick={(e) => triggerDelete(e, "skill", us.id, us.skill_name)} className="p-2 text-white/5 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16} /></button>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between"><div className="flex items-center gap-2 text-[#8d807c]"><Clock size={14} /><span className="text-[10px] font-black uppercase">Practice</span></div><span className="text-sm font-black text-[#f8f6f3]">{us.hours_practiced || 0} HRS</span></div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-white/[0.03] rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-[#edc390] to-[#e7380d]" style={{ width: `${Math.min(((us.hours_practiced || 0) / 200) * 100, 100)}%` }} /></div>
                    <SkillHoursControl skillId={us.id} onUpdate={handleUpdatePracticeHours} />
                  </div>
                </div>
              </GlassCard>
            ))
          )}
        </div>
      )}
    </div>
  );

  const renderProjects = () => (
    <div className="space-y-8 animate-rise-in">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-black text-[#f8f6f3] flex items-center gap-2"><Layers size={24} className="text-[#edc390]" /> Projects Workspace</h2><p className="text-sm text-[#8d807c]">Manage your engineering narrative.</p></div>
        <Button onClick={() => {
          setProjectTitle("");
          setProjectDesc("");
          setProjectTech("");
          setProjectGithub("");
          setProjectStatus("PLANNING");
          setProjectDifficulty("BEGINNER");
          setProjectProgress(0);
          setShowNewProjectModal(true);
        }} className="bg-[#e7380d] text-white">Initialize New Project</Button>
      </div>
      {projectsResource.isLoading ? <Skeleton className="h-64 w-full rounded-2xl" /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {!projectsResource.data || projectsResource.data.length === 0 ? (
            <GlassCard className="col-span-full p-20 text-center flex flex-col items-center gap-6 border-dashed border-white/10"><Code2 size={64} className="text-white/5" /><p className="text-[#f8f6f3] font-bold">Workspace empty</p><Button onClick={() => setShowNewProjectModal(true)}>Start First Project</Button></GlassCard>
          ) : (
            projectsResource.data.map((project) => (
              <GlassCard
                key={project.id}
                onClick={() => setSelectedProject(project)}
                className="p-6 group hover:border-[#edc390]/30 transition-all select-none relative overflow-hidden cursor-pointer"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1 min-w-0 pr-4">
                    <h3 className="font-bold text-[#f8f6f3] group-hover:text-[#edc390] truncate text-lg transition-colors">{project.title}</h3>
                    <p className="text-[10px] font-black text-[#e7380d] uppercase tracking-widest mt-1">{project.difficulty}</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleToggleStarProject(e, project.id, project.is_starred); }}
                    className={`p-2 rounded-lg transition-all ${project.is_starred ? 'bg-[#edc390]/10 text-[#edc390]' : 'text-white/5 hover:text-[#edc390]'}`}
                  >
                    <Star size={18} fill={project.is_starred ? "currentColor" : "none"} />
                  </button>
                </div>
                <p className="text-sm text-[#8d807c] line-clamp-3 h-15 leading-relaxed mb-6">{project.description}</p>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.03] text-[#8d807c] font-black tracking-widest uppercase">{project.status}</span>
                  <span className="text-[10px] font-black text-[#8d807c]">{project.progress_percentage}%</span>
                </div>
                <div className="h-1.5 bg-white/[0.03] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#e7380d] to-[#edc390]" style={{ width: `${project.progress_percentage}%` }} />
                </div>
                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                  <div className="flex flex-wrap gap-2 flex-1">
                    {project.tech_stack?.split(/[ ,./]+/).filter(Boolean).slice(0, 3).map((tech, i) => (
                      <span key={i} className="text-[9px] font-bold text-[#8d807c] bg-white/[0.02] px-2 py-1 rounded border border-white/5">#{tech}</span>
                    ))}
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); triggerDelete(e, "project", project.id, project.title); }}
                    className="p-2 text-white/5 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all ml-4"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </GlassCard>
            ))
          )}
        </div>
      )}
    </div>
  );

  const renderProfilePreviewModal = () => {
    if (!selectedProfilePreview && !isPreviewLoading) return null;

    return (
      <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-rise-in">
        <div className="w-full max-w-xl">
          <GlassCard className="p-8 relative shadow-2xl border-[#edc390]/20 overflow-hidden">
            <button
              onClick={() => setSelectedProfilePreview(null)}
              className="absolute right-6 top-6 text-[#8d807c] hover:text-[#f8f6f3] z-50 transition-colors"
            >
              <X size={24} />
            </button>

            {isPreviewLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Activity size={48} className="text-[#edc390] animate-pulse mb-4" />
                <p className="text-[#8d807c] font-black uppercase tracking-widest animate-pulse">Syncing Narrative...</p>
              </div>
            ) : (
              <div className="relative z-10">
                <div className="flex flex-col sm:flex-row items-center gap-8 mb-10 pb-10 border-b border-white/5">
                  <div className="h-24 w-24 rounded-2xl border-2 border-[#edc390] p-1 bg-[#0a0a0a] rotate-3 hover:rotate-0 transition-transform duration-500">
                    {selectedProfilePreview.avatar_base64 ? (
                      <img src={selectedProfilePreview.avatar_base64} className="h-full w-full rounded-xl object-cover" alt="Avatar" />
                    ) : (
                      <div className="h-full w-full bg-white/5 rounded-xl flex items-center justify-center text-[#edc390]">
                        <User size={32} />
                      </div>
                    )}
                  </div>
                  <div className="text-center sm:text-left">
                    <h2 className="text-3xl font-black text-[#f8f6f3] uppercase tracking-tight">
                      {selectedProfilePreview.first_name ? `${selectedProfilePreview.first_name} ${selectedProfilePreview.last_name}` : selectedProfilePreview.username}
                    </h2>
                    <p className="text-[#8d807c] font-bold mt-1">@{selectedProfilePreview.username}</p>
                    <div className="flex items-center gap-4 mt-4">
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#edc390]/10 border border-[#edc390]/20">
                        <Zap size={12} className="text-[#edc390]" />
                        <span className="text-[10px] font-black text-[#edc390] uppercase">{selectedProfilePreview.depth_score} Devs</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e7380d]/10 border border-[#e7380d]/20">
                        <Flame size={12} className="text-[#e7380d]" />
                        <span className="text-[10px] font-black text-[#e7380d] uppercase">{selectedProfilePreview.streak_count} Streak</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-white/[0.02] p-6 rounded-2xl border border-white/5 group hover:bg-white/[0.04] transition-colors">
                    <p className="text-[10px] font-black text-[#8d807c] uppercase mb-1 tracking-widest">Engineering Bio</p>
                    <p className="text-sm text-[#f8f6f3] leading-relaxed line-clamp-3 italic">
                      "{selectedProfilePreview.bio || "This engineer is focused on building without words."}"
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="bg-white/[0.02] p-4 rounded-xl border border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles size={14} className="text-[#edc390]" />
                        <span className="text-[10px] font-black text-[#8d807c] uppercase">Skills</span>
                      </div>
                      <span className="text-lg font-black text-[#f8f6f3]">{selectedProfilePreview.skills_count || 0}</span>
                    </div>
                    <div className="bg-white/[0.02] p-4 rounded-xl border border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Layers size={14} className="text-[#edc390]" />
                        <span className="text-[10px] font-black text-[#8d807c] uppercase">Projects</span>
                      </div>
                      <span className="text-lg font-black text-[#f8f6f3]">{selectedProfilePreview.projects_count || 0}</span>
                    </div>
                  </div>
                </div>

                {selectedProfilePreview.featured_badge && (
                  <div className="p-4 rounded-2xl bg-[#edc390]/5 border border-[#edc390]/10 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-[#edc390]/10 flex items-center justify-center text-[#edc390]">
                      <Trophy size={20} />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-[#8d807c] uppercase tracking-widest mb-0.5">Top Distinction</p>
                      <p className="text-sm font-black text-[#edc390] uppercase">{selectedProfilePreview.featured_badge.name}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    );
  };

  const renderActivity = () => {
    if (isActivityLoading) return <div className="flex flex-col items-center justify-center h-96"><Activity size={48} className="text-[#edc390] animate-pulse mb-4" /><p className="text-[#8d807c] font-black uppercase tracking-widest animate-pulse">Syncing Telemetry...</p></div>;
    if (!activityHubData) return <div className="text-center py-20 text-[#8d807c]">Failed to load activity narrative.</div>;

    const COLORS = ['#edc390', '#e7380d', '#505b90', '#22c55e', '#ef4444'];

    return (
      <div className="space-y-8 animate-rise-in pb-20">
        {/* Row 1: Velocity and Effort */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Engineering Velocity */}
          <GlassCard className="lg:col-span-2 p-8 border-white/5 shadow-xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-black text-[#f8f6f3] flex items-center gap-2">
                  <TrendingUp size={20} className="text-[#edc390]" />
                  Engineering Velocity
                </h3>
                <p className="text-[10px] font-black text-[#8d807c] uppercase tracking-wider mt-1">30-Day Productivity Trend</p>
              </div>
              <div className="bg-white/5 px-3 py-1 rounded-full text-[10px] font-black text-[#f8f6f3] uppercase">Live Data</div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={activityHubData.velocity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis
                    dataKey="date"
                    stroke="rgba(255,255,255,0.3)"
                    fontSize={10}
                    tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
                  />
                  <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1d1917', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    itemStyle={{ color: '#edc390', fontSize: '12px', fontWeight: 'bold' }}
                    labelStyle={{ color: '#8d807c', fontSize: '10px', marginBottom: '4px' }}
                  />
                  <Line type="monotone" dataKey="count" stroke="#edc390" strokeWidth={3} dot={{ fill: '#edc390', r: 4 }} activeDot={{ r: 6, stroke: '#1d1917', strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          {/* Effort Allocation */}
          <GlassCard className="p-8 border-white/5 shadow-xl">
            <div className="mb-8">
              <h3 className="text-lg font-black text-[#f8f6f3] flex items-center gap-2">
                <PieChart size={20} className="text-[#edc390]" />
                Effort Allocation
              </h3>
              <p className="text-[10px] font-black text-[#8d807c] uppercase tracking-wider mt-1">Activity Distribution</p>
            </div>
            <div className="h-[250px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={activityHubData.effort}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    nameKey="label"
                    isAnimationActive={true}
                    animationBegin={0}
                    animationDuration={800}
                    stroke="none"
                  >
                    {(activityHubData?.effort || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1d1917', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                    formatter={(value, name) => [value, name]}
                  />
                </RePieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] font-black text-[#8d807c] uppercase">Total Yield</span>
                <span className="text-2xl font-black text-[#f8f6f3]">{(activityHubData?.effort || []).reduce((a, b) => a + b.value, 0)}</span>
              </div>
            </div>
            <div className="mt-6 space-y-2">
              {activityHubData.effort.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-[10px] font-black text-[#8d807c] uppercase">{item.label}</span>
                  </div>
                  <span className="text-xs font-black text-[#f8f6f3]">{item.value}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Row 2: Badges and Milestones */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Badge Showcase */}
          <GlassCard className="p-8 border-white/5 shadow-xl">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-[#f8f6f3] flex items-center gap-2">
                  <Award size={20} className="text-[#edc390]" />
                  Achievement Showcase
                </h3>
                <p className="text-[10px] font-black text-[#8d807c] uppercase tracking-wider mt-1">Platform Progression & Milestones</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-[#8d807c] uppercase tracking-widest">
                  {activityHubData.all_badges.filter(b => b.awarded_at).length} / {activityHubData.all_badges.length}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {activityHubData.all_badges
                .sort((a, b) => {
                  const aUnlocked = !!a.awarded_at;
                  const bUnlocked = !!b.awarded_at;

                  if (aUnlocked && !bUnlocked) return -1;
                  if (!aUnlocked && bUnlocked) return 1;

                  if (aUnlocked && bUnlocked) {
                    return new Date(b.awarded_at) - new Date(a.awarded_at);
                  }

                  return 0;
                })
                .map((badge, i) => {
                  const isUnlocked = !!badge.awarded_at;
                  const isFeatured = currentUser?.featured_badge?.id === badge.id;

                  return (
                    <div
                      key={i}
                      onClick={() => setSelectedBadgeDetails(badge)}
                      className={`
                        group relative bg-white/[0.03] border p-4 rounded-2xl flex flex-col items-center text-center transition-all cursor-pointer
                        ${isUnlocked
                          ? 'border-white/5 bg-gradient-to-br from-white/[0.05] to-transparent hover:border-[#edc390]/30 hover:shadow-[0_0_20px_rgba(237,195,144,0.1)] shadow-sm'
                          : 'border-white/[0.02] opacity-40 grayscale'}
                        ${badge.is_showcased ? 'border-[#edc390] bg-[#edc390]/5' : ''}
                      `}
                    >
                      {badge.is_showcased && (
                        <div className="absolute -top-2 -right-2 bg-[#edc390] text-black px-2 py-0.5 rounded-full text-[8px] font-black uppercase shadow-lg z-10 flex items-center gap-1">
                          <Star size={8} fill="currentColor" />
                          Gallery
                        </div>
                      )}

                      <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform relative">
                        {!isUnlocked && <Lock size={12} className="absolute inset-0 m-auto text-white/40" />}
                        <div className={`${isUnlocked ? 'drop-shadow-[0_0_8px_rgba(237,195,144,0.4)]' : ''}`}>
                          {badge.icon_name === 'Zap' && <Zap size={24} className="text-[#edc390]" />}
                          {badge.icon_name === 'Layers' && <Layers size={24} className="text-[#edc390]" />}
                          {badge.icon_name === 'Crown' && <Crown size={24} className="text-[#edc390]" />}
                          {badge.icon_name === 'Flame' && <Flame size={24} className="text-[#e7380d]" />}
                          {badge.icon_name === 'Trophy' && <Trophy size={24} className="text-[#edc390]" />}
                          {badge.icon_name === 'Box' && <Box size={24} className="text-[#505b90]" />}
                          {badge.icon_name === 'Sparkles' && <Sparkles size={24} className="text-[#edc390]" />}
                          {badge.icon_name === 'Package' && <Package size={24} className="text-[#c66b3b]" />}
                          {badge.icon_name === 'Terminal' && <Terminal size={24} className="text-green-400" />}
                          {badge.icon_name === 'BookOpen' && <BookOpen size={24} className="text-[#505b90]" />}
                          {badge.icon_name === 'GitBranch' && <GitBranch size={24} className="text-[#edc390]" />}
                        </div>
                      </div>

                      <span className="text-[10px] font-black text-[#f8f6f3] uppercase tracking-tighter line-clamp-1">{badge.name}</span>
                      <span className="text-[8px] font-black text-[#8d807c] uppercase mt-1 tracking-widest">{badge.rarity}</span>

                      {isUnlocked && !isFeatured && (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-2xl transition-opacity">
                          <span className="text-[8px] font-black text-[#edc390] uppercase tracking-widest border border-[#edc390]/30 px-2 py-1 rounded">Feature Badge</span>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </GlassCard>

          {/* Milestone Narrative */}
          <GlassCard className="p-8 border-white/5 shadow-xl">
            <div className="mb-8">
              <h3 className="text-lg font-black text-[#f8f6f3] flex items-center gap-2">
                <Clock size={20} className="text-[#edc390]" />
                Milestone Narrative
              </h3>
              <p className="text-[10px] font-black text-[#8d807c] uppercase tracking-wider mt-1">Platform Breakthroughs Only</p>
            </div>
            <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 hide-scrollbar">
              {activityHubData.milestones.map((m, i) => (
                <div key={i} className="flex gap-4 group">
                  <div className="flex flex-col items-center">
                    <div className="h-4 w-4 rounded-full border-2 border-[#edc390] bg-[#0a0a0a] group-hover:bg-[#edc390] transition-colors flex items-center justify-center p-0.5">
                      {m.activity_type === 'REPO_IMPORTED' && <Sparkles size={10} className="text-[#edc390]" />}
                      {m.activity_type === 'PROJECT_COMPLETED' && <CheckCircle size={10} className="text-green-400" />}
                      {m.activity_type === 'PROJECT_IN_PROGRESS' && <Code size={10} className="text-[#edc390]" />}
                    </div>
                    {i < activityHubData.milestones.length - 1 && <div className="w-[1px] flex-1 bg-white/5 mt-2" />}
                  </div>
                  <div className="pb-6">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black text-[#8d807c] uppercase tracking-widest">
                        {new Date(m.created_at).toLocaleDateString()}
                      </span>
                      <span className="h-1 w-1 rounded-full bg-white/20" />
                      <span className="text-[10px] font-black text-[#edc390] uppercase tracking-widest">
                        {m.activity_type.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-[#f8f6f3] font-medium leading-relaxed">{m.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Row 3: Hourly Intensity and GitHub Pulse */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Focus Intensity (Hourly) */}
          <GlassCard className="lg:col-span-7 p-8 border-white/5 shadow-xl relative overflow-hidden h-fit">
            <div className="absolute top-0 right-0 p-8 opacity-5"><Activity size={120} /></div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 relative z-10">
              <div className="flex items-center gap-4">
                <h3 className="text-lg font-black text-[#f8f6f3] flex items-center gap-2">
                  <Zap size={20} className="text-[#edc390]" />
                  Focus Intensity
                </h3>
                <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/5">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-white/10 disabled:opacity-30 text-[#f8f6f3]"
                    disabled={selectedDayIndex === 0}
                    onClick={() => setSelectedDayIndex(prev => prev - 1)}
                  >
                    <ChevronLeft size={14} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-white/10 disabled:opacity-30 text-[#f8f6f3]"
                    disabled={selectedDayIndex === 14}
                    onClick={() => setSelectedDayIndex(prev => prev + 1)}
                  >
                    <ChevronRight size={14} />
                  </Button>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-[10px] font-black text-[#8d807c] uppercase tracking-wider">
                  {activityHubData?.hourly?.[selectedDayIndex]?.date === new Date().toISOString().split('T')[0]
                    ? "Today's Telemetry"
                    : activityHubData?.hourly?.[selectedDayIndex]?.date
                      ? new Date(activityHubData.hourly[selectedDayIndex].date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })
                      : "Loading..."
                  }
                </p>
              </div>
            </div>

            <div className="grid grid-cols-6 sm:grid-cols-12 gap-2 relative z-10">
              {Array.from({ length: 24 }).map((_, hour) => {
                const dayData = activityHubData?.hourly?.[selectedDayIndex];
                const count = dayData?.hours?.[hour] || 0;
                const intensity = Math.min(count / 5, 1);

                return (
                  <div
                    key={hour}
                    className="h-14 rounded-lg transition-all flex flex-col items-center justify-between py-2 border border-white/5"
                    style={{
                      backgroundColor: `rgba(237, 195, 144, ${0.05 + intensity * 0.4})`,
                      borderColor: `rgba(237, 195, 144, ${0.1 + intensity * 0.2})`
                    }}
                  >
                    <span className="text-[8px] font-black text-[#8d807c] uppercase">{hour}h</span>
                    {intensity > 0 && (
                      <div className="h-1 w-1 rounded-full bg-[#edc390] animate-pulse shadow-[0_0_8px_rgba(237,195,144,0.6)]" />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-8 flex gap-8 border-t border-white/5 pt-6 relative z-10">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black text-[#8d807c] uppercase tracking-widest">Peak Window</span>
                <span className="text-xl font-black text-[#edc390]">
                  {(() => {
                    const hours = activityHubData?.hourly?.[selectedDayIndex]?.hours || [];
                    if (hours.length === 0) return "0h";
                    const maxVal = Math.max(...hours);
                    if (maxVal === 0) return "---";
                    return `${hours.indexOf(maxVal)}h`;
                  })()}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black text-[#8d807c] uppercase tracking-widest">Active Windows</span>
                <span className="text-xl font-black text-[#f8f6f3]">
                  {activityHubData?.hourly?.[selectedDayIndex]?.hours?.filter(h => h > 0).length || 0} Hours
                </span>
              </div>
            </div>
          </GlassCard>

          {/* GitHub Pulse */}
          <GlassCard className="lg:col-span-5 p-8 border-white/5 shadow-xl flex flex-col h-fit max-h-full">
            <div className="mb-8 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-lg font-black text-[#f8f6f3] flex items-center gap-2">
                  <GithubIcon size={20} className="text-[#edc390]" />
                  GitHub Live Pulse
                </h3>
                <p className="text-[10px] font-black text-[#8d807c] uppercase tracking-wider mt-1">Real-time Stream Connectivity</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[8px] font-black text-[#8d807c] uppercase">Live</span>
              </div>
            </div>
            <div className="space-y-4 overflow-y-auto pr-2 hide-scrollbar max-h-[300px]">
              {githubActivityResource.data?.map((event, i) => (
                <div key={i} className="bg-white/[0.02] border border-white/5 p-4 rounded-xl flex items-start gap-3 hover:bg-white/[0.04] transition-colors">
                  <div className="mt-1">
                    {event.type === 'PushEvent' ? <Code size={14} className="text-green-400" /> : <GitBranch size={14} className="text-[#edc390]" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-[#f8f6f3] font-bold">
                      {event.type.replace('Event', '')} <span className="text-[#8d807c] font-medium">on</span> {event.repo.name.split('/')[1]}
                    </p>
                    <p className="text-[10px] text-[#8d807c] mt-1 line-clamp-1">{event.payload?.commits?.[0]?.message || 'Automated telemetry update'}</p>
                  </div>
                  <span className="text-[8px] font-black text-[#8d807c] uppercase whitespace-nowrap">
                    {new Date(event.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    );
  };

  const renderGithub = () => {
    if (userResource.isLoading) {
      return (
        <div className="space-y-8 animate-rise-in">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-48 w-full rounded-2xl" />)}
          </div>
        </div>
      );
    }

    const profile = githubProfileResource.data;
    const repos = githubReposResource.data || [];
    const isLoading = githubProfileResource.isLoading || githubReposResource.isLoading;

    if (!currentUser.github_username) {
      return (
        <div className="flex flex-col items-center justify-center h-96 text-center animate-rise-in">
          <GithubIcon size={64} className="text-white/5 mb-6" />
          <h2 className="text-2xl font-black text-[#f8f6f3] mb-2">GitHub Not Linked</h2>
          <p className="text-[#8d807c] mb-6">Set your GitHub username in your profile to enable this workspace.</p>
          <Button onClick={() => setShowProfile(true)}>Update Profile</Button>
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="space-y-8 animate-rise-in">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-48 w-full rounded-2xl" />)}
          </div>
        </div>
      );
    }

    if (!profile) {
      const errorMsg = githubProfileResource.error?.response?.data?.error || `Could not retrieve data for username: ${currentUser.github_username}`;
      return (
        <div className="flex flex-col items-center justify-center h-96 text-center animate-rise-in">
          <AlertCircle size={64} className="text-red-400/20 mb-6" />
          <h2 className="text-2xl font-black text-[#f8f6f3] mb-2">Fetch Failed</h2>
          <p className="text-[#8d807c] mb-6">{errorMsg}</p>
          <Button onClick={() => githubProfileResource.reload()}>Retry Sync</Button>
        </div>
      );
    }

    return (
      <div className="space-y-10 animate-rise-in">
        {/* GitHub Header / Profile Stats */}
        <GlassCard className="p-8 border-[#edc390]/10 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-5"><GithubIcon size={120} /></div>
          <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
            <div className="h-24 w-24 rounded-2xl border-2 border-[#edc390] p-1 overflow-hidden">
              <img src={profile.avatar_url} alt="GH" className="h-full w-full rounded-xl object-cover" />
            </div>
            <div className="text-center md:text-left flex-1">
              <h2 className="text-3xl font-black text-[#f8f6f3]">{profile.name || profile.login}</h2>
              <p className="text-[#8d807c] flex items-center justify-center md:justify-start gap-2 mt-1">
                <GithubIcon size={14} /> @{profile.login}
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-6 mt-6">
                <div className="flex items-center gap-2"><Users size={16} className="text-[#edc390]" /><span className="text-sm font-black text-[#f8f6f3]">{profile.followers}</span><span className="text-[10px] font-bold text-[#8d807c] uppercase">Followers</span></div>
                <div className="flex items-center gap-2"><Eye size={16} className="text-[#e7380d]" /><span className="text-sm font-black text-[#f8f6f3]">{profile.following}</span><span className="text-[10px] font-bold text-[#8d807c] uppercase">Following</span></div>
                <div className="flex items-center gap-2"><Book size={16} className="text-[#c66b3b]" /><span className="text-sm font-black text-[#f8f6f3]">{profile.public_repos}</span><span className="text-[10px] font-bold text-[#8d807c] uppercase">Repos</span></div>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <a href={profile.html_url} target="_blank" rel="noreferrer"><Button size="sm" className="w-full bg-white/5 border border-white/10 text-white hover:bg-white/10">GitHub Profile</Button></a>
            </div>
          </div>
        </GlassCard>

        {/* Repositories Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-black text-[#f8f6f3] flex items-center gap-2"><GitBranch size={22} className="text-[#edc390]" /> Repository Engine</h2>
            <span className="text-xs font-bold text-[#8d807c] uppercase tracking-widest">{repos.length} Public Repositories</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {repos.map((repo) => (
              <GlassCard key={repo.id} className="p-6 group hover:border-[#edc390]/20 transition-all flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-[#f8f6f3] group-hover:text-[#edc390] truncate text-base flex-1 transition-colors">{repo.name}</h3>
                  <div className="flex items-center gap-3 ml-2">
                    <div className="flex items-center gap-1 text-[#8d807c]"><Star size={12} fill="currentColor" /><span className="text-xs font-black">{repo.stargazers_count}</span></div>
                  </div>
                </div>
                <p className="text-xs text-[#8d807c] line-clamp-2 h-9 mb-6 leading-relaxed">{repo.description || "No description provided."}</p>
                <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {repo.language && (
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-[#edc390]" />
                        <span className="text-[10px] font-black text-[#f8f6f3] uppercase tracking-tighter">{repo.language}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-[#8d807c]"><GitFork size={12} /><span className="text-[10px] font-black">{repo.forks_count}</span></div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleImportRepo(repo)}
                      className="text-[10px] font-black text-[#edc390] uppercase tracking-widest hover:underline"
                    >
                      Import
                    </button>
                    <a href={repo.html_url} target="_blank" rel="noreferrer" className="text-white/20 hover:text-[#edc390] transition-colors"><ExternalLink size={16} /></a>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderLeaderboard = () => {
    if (leaderboardResource.isLoading) {
      return (
        <div className="space-y-8 animate-rise-in">
          <Skeleton className="h-48 w-full rounded-2xl" />
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)}
          </div>
        </div>
      );
    }

    const data = leaderboardResource.data || { global: [], weekly: [], today: null, streaks: [] };
    const currentList = data[leaderboardTab] || [];
    const topThree = currentList.slice(0, 3);
    const rest = currentList.slice(3);

    return (
      <div className="space-y-8 animate-rise-in max-h-[calc(100vh-180px)] flex flex-col">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0">
          <div>
            <h2 className="text-2xl font-black text-[#f8f6f3] flex items-center gap-2">
              <Trophy size={28} className="text-[#edc390]" /> Engineering Rankings
            </h2>
            <p className="text-sm text-[#8d807c]">Current standings based on {leaderboardTab === 'streaks' ? 'activity streaks' : 'DevScore'}.</p>
          </div>
          <div className="flex bg-white/[0.03] p-1 rounded-xl border border-white/5">
            {['global', 'weekly', 'streaks'].map((tab) => (
              <button
                key={tab}
                onClick={() => setLeaderboardTab(tab)}
                className={`
                  px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all
                  ${leaderboardTab === tab ? 'bg-[#e7380d] text-white shadow-lg' : 'text-[#8d807c] hover:text-[#f8f6f3]'}
                `}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col gap-6">
          {/* Rank 1 Spotlight */}
          {topThree[0] && (
            <div className="shrink-0 cursor-pointer" onClick={() => fetchProfilePreview(topThree[0].username)}>
              <GlassCard className="p-6 border-[#edc390]/30 relative overflow-hidden bg-gradient-to-r from-[#edc390]/10 to-transparent group-hover:bg-[#edc390]/20 transition-all">
                <div className="absolute top-0 right-0 h-full w-64 bg-[#edc390]/5 skew-x-[-20deg] translate-x-32" />
                <div className="relative z-10 flex items-center gap-6">
                  <div className="relative">
                    <div className="relative h-20 w-20 rounded-2xl border-2 border-[#edc390] p-1 bg-[#0a0a0a]">
                      {topThree[0].avatar_base64 ? <img src={topThree[0].avatar_base64} className="h-full w-full rounded-xl object-cover" /> : <div className="h-full w-full bg-white/5 rounded-xl flex items-center justify-center text-[#edc390]"><User size={32} /></div>}
                    </div>
                    <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-[#edc390] text-black flex items-center justify-center font-black text-lg border-4 border-[#1d1917]">1</div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-black text-[#f8f6f3] uppercase tracking-tight">
                      {topThree[0].first_name ? `${topThree[0].first_name} ${topThree[0].last_name}` : topThree[0].username}
                    </h3>
                    <p className="text-sm text-[#8d807c] font-medium">@{topThree[0].username}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-black text-[#edc390] tabular-nums">{topThree[0].score || topThree[0].depth_score || topThree[0].streak_count || 0}</p>
                    <p className="text-[10px] font-black text-[#8d807c] uppercase tracking-widest">
                      {leaderboardTab === 'streaks' ? 'Day Streak' : 'DevScore'}
                    </p>
                  </div>
                </div>
              </GlassCard>
            </div>
          )}

          {/* Scrollable List Body */}
          <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar scroll-smooth pb-10">
            {currentList.slice(1).length === 0 && !topThree[0] && (
              <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-white/5 rounded-3xl opacity-40">
                <Users size={48} className="text-[#8d807c] mb-4" />
                <p className="text-xs font-black uppercase tracking-widest text-[#8d807c]">Awaiting Telemetry Sync</p>
              </div>
            )}

            {currentList.slice(1).map((entry, idx) => (
              <GlassCard
                key={entry.username}
                onClick={() => fetchProfilePreview(entry.username)}
                className={`p-4 flex items-center justify-between group hover:border-white/10 transition-all cursor-pointer ${entry.username === currentUser.username ? 'border-[#e7380d]/30 bg-[#e7380d]/5' : 'bg-white/[0.01]'}`}
              >
                <div className="flex items-center gap-6">
                  <div className="w-8 text-sm font-black text-[#8d807c] flex items-center gap-1">
                    #{entry.rank || idx + 2}
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-[#0a0a0a] border border-white/10 p-0.5 overflow-hidden">
                    {entry.avatar_base64 ? <img src={entry.avatar_base64} className="h-full w-full rounded-[9px] object-cover" /> : <div className="h-full w-full flex items-center justify-center text-[#8d807c]"><User size={16} /></div>}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-black text-[#f8f6f3] group-hover:text-[#edc390] transition-colors">
                        {entry.first_name ? `${entry.first_name} ${entry.last_name}` : entry.username}
                      </p>
                      {entry.username === currentUser.username && (
                        <span className="px-1.5 py-0.5 rounded-sm bg-[#e7380d]/20 text-[#e7380d] text-[8px] font-black uppercase tracking-widest">You</span>
                      )}
                    </div>
                    <p className="text-[9px] text-[#8d807c] font-medium">@{entry.username}</p>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <p className="text-sm font-black text-[#f8f6f3] tabular-nums">{entry.score || entry.depth_score || entry.streak_count || 0}</p>
                    {leaderboardTab === 'streaks' && (
                      <p className="text-[8px] font-black text-[#8d807c] uppercase tracking-tighter">Streak</p>
                    )}
                  </div>
                  <div className="h-8 w-1 bg-white/5 rounded-full overflow-hidden hidden md:block">
                    <div className="h-1/2 bg-[#e7380d] rounded-full" />
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout currentView={currentView} onNavigate={setCurrentView}>
      <div className="min-h-screen p-8 flex flex-col relative">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-white/5 mb-10">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-black text-[#f8f6f3]">Welcome, <span className="text-[#edc390]">{currentUser?.first_name || currentUser?.username}</span></h1>
              {currentUser?.featured_badge && (
                <div className="flex items-center gap-2 bg-[#edc390]/10 border border-[#edc390]/20 px-3 py-1 rounded-full animate-pulse-slow">
                  <Sparkles size={14} className="text-[#edc390]" />
                  <span className="text-[10px] font-black text-[#edc390] uppercase tracking-wider">{currentUser.featured_badge.name}</span>
                </div>
              )}
            </div>
            <p className="text-sm text-[#8d807c]">Monitor telemetry and build narrative.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end mr-2">
              <span className="text-sm font-black text-[#f8f6f3] tabular-nums">
                {currentTime.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })} • {currentTime.toLocaleTimeString(undefined, { hour12: false })}
              </span>
            </div>
            <div
              onClick={() => setShowStreakModal(true)}
              className="flex items-center gap-2 bg-white/[0.03] px-4 py-2 rounded-full border border-white/5 text-[#e7380d] cursor-pointer hover:bg-white/5 transition-colors group"
            >
              <Flame size={18} className="group-hover:scale-110 transition-transform" />
              <span className="text-sm font-black text-[#f8f6f3]">{currentUser?.streak_count || 0}</span>
            </div>
            <button onClick={() => setShowProfile(true)} className="h-12 w-12 rounded-full border-2 border-[#e7380d] p-0.5 overflow-hidden transition-transform hover:scale-105">
              {avatarUrl ? <img src={avatarUrl} alt="U" className="h-full w-full rounded-full object-cover" /> : <div className="flex h-full w-full items-center justify-center rounded-full bg-[#505b90]/30 text-[#edc390]"><User size={22} /></div>}
            </button>
          </div>
        </header>

        {currentView === "overview" && renderOverview()}
        {currentView === "skills" && renderSkills()}
        {currentView === "projects" && renderProjects()}
        {currentView === "github" && renderGithub()}
        {currentView === "activity" && renderActivity()}
        {currentView === "leaderboard" && renderLeaderboard()}
        {currentView !== "overview" && currentView !== "skills" && currentView !== "projects" && currentView !== "github" && currentView !== "activity" && currentView !== "leaderboard" && (
          <div className="flex flex-col items-center justify-center h-96 text-center animate-rise-in"><Layers size={64} className="text-white/5 mb-6" /><h2 className="text-2xl font-black text-[#f8f6f3] mb-2">{currentView} Module</h2><Button onClick={() => setCurrentView("overview")}>Back to Dashboard</Button></div>
        )}
      </div>

      <ConfirmationModal
        {...confirmState}
        onCancel={() => setConfirmState({ ...confirmState, isOpen: false })}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />

      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed top-8 right-8 z-[300] animate-slide-in-right">
          <div className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-[#0a0a0a]/90 backdrop-blur-xl border border-[#edc390]/20 shadow-2xl">
            <div className="h-2 w-2 rounded-full bg-[#edc390] animate-pulse" />
            <p className="text-[10px] font-black uppercase tracking-widest text-[#f8f6f3]">{toastMessage}</p>
          </div>
        </div>
      )}

      {/* Skill Detail Modal */}
      {selectedSkill && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-rise-in">
          <div className="w-full max-w-2xl"><GlassCard className="p-8 relative shadow-2xl border-white/10">
            <button onClick={() => setSelectedSkill(null)} className="absolute right-6 top-6 text-[#8d807c] hover:text-[#f8f6f3] transition-colors"><X size={24} /></button>
            <div className="flex items-center gap-4 mb-8">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#e7380d] to-[#edc390] flex items-center justify-center text-white shadow-lg"><Sparkles size={32} /></div>
              <div>
                <h2 className="text-3xl font-black text-[#f8f6f3]">{selectedSkill.skill_name}</h2>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs font-black text-[#e7380d] uppercase tracking-widest">{selectedSkill.proficiency}</span>
                  <span className="h-1 w-1 rounded-full bg-white/20" />
                  <span className="text-xs font-bold text-[#8d807c]">{selectedSkill.category || "General Technology"}</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white/[0.02] p-4 rounded-2xl border border-white/5"><p className="text-[10px] font-black text-[#8d807c] uppercase mb-1">Time Invested</p><p className="text-xl font-black text-[#f8f6f3]">{selectedSkill.hours_practiced || 0} <span className="text-xs text-[#8d807c]">HRS</span></p></div>
              <div className="bg-white/[0.02] p-4 rounded-2xl border border-white/5"><p className="text-[10px] font-black text-[#8d807c] uppercase mb-1">Projects</p><p className="text-xl font-black text-[#f8f6f3]">{getProjectCountForSkill(selectedSkill.skill_name)} <span className="text-xs text-[#8d807c]">APPS</span></p></div>
              <div className="bg-white/[0.02] p-4 rounded-2xl border border-white/5"><p className="text-[10px] font-black text-[#8d807c] uppercase mb-1">Expertise</p><p className="text-xl font-black text-[#f8f6f3]">{calculateExperience(selectedSkill.started_learning_date)}</p></div>
            </div>
            <div className="space-y-2"><h4 className="text-[10px] font-black text-[#8d807c] uppercase flex items-center gap-2"><Info size={12} /> Narrative Description</h4><p className="text-sm text-[#f8f6f3] leading-relaxed bg-white/[0.02] p-6 rounded-2xl border border-white/5">{selectedSkill.description || "No detailed narrative provided for this skill yet."}</p></div>
            <div className="mt-8 pt-8 border-t border-white/5 flex justify-between items-center">
              <div className="flex items-center gap-2 text-[#8d807c]"><Calendar size={14} /><span className="text-[10px] font-black">TRACKED SINCE {new Date(selectedSkill.started_learning_date || Date.now()).toLocaleDateString()}</span></div>
              <Button variant="danger" size="sm" onClick={(e) => triggerDelete(e, "skill", selectedSkill.id, selectedSkill.skill_name)} className="opacity-50 hover:opacity-100 transition-opacity">Retire Skill</Button>
            </div>
          </GlassCard></div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfile && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-rise-in">
          <div className="w-full max-w-2xl my-auto"><GlassCard className="p-8 relative shadow-2xl border-white/10">
            <button onClick={() => { setIsEditing(false); setShowProfile(false); }} className="absolute right-6 top-6 text-[#8d807c] hover:text-[#f8f6f3]"><X size={24} /></button>
            <div className="flex flex-col sm:flex-row items-center gap-8 pb-8 border-b border-white/5 mb-8">
              <div className="relative group">
                <div className="h-32 w-32 rounded-full border-4 border-[#edc390] overflow-hidden p-1 bg-[#0a0a0a]">
                  {avatarUrl ? <img src={avatarUrl} alt="P" className="h-full w-full rounded-full object-cover" /> : <div className="flex h-full w-full items-center justify-center rounded-full bg-[#505b90]/20 text-[#edc390]"><User size={56} /></div>}
                </div>
                {isEditing && (
                  <div className="absolute -bottom-2 -right-2 flex gap-1">
                    <button onClick={() => fileInputRef.current.click()} className="p-2 rounded-full bg-[#e7380d] text-white"><Camera size={16} /></button>
                    {avatarUrl && <button onClick={handleRemovePhoto} className="p-2 rounded-full bg-white/10 text-red-400"><Trash2 size={16} /></button>}
                  </div>
                )}
              </div>
              <div className="text-center sm:text-left flex-1">
                <h2 className="text-3xl font-black text-[#f8f6f3]">{fullNameDisplay || currentUser?.username}</h2>
                <p className="text-[#8d807c]">{currentUser?.email}</p>
                {!isEditing && <Button onClick={handleStartEdit} size="sm" variant="secondary" className="mt-6">Edit Profile</Button>}
              </div>
            </div>
            {isEditing ? (
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="grid grid-cols-2 gap-4"><Input label="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} /><Input label="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} /></div>
                <div className="grid grid-cols-2 gap-4"><Input label="GitHub" value={githubUsername} onChange={(e) => setGithubUsername(e.target.value)} icon={<GitBranch size={16} />} /><Input label="Institution" value={collegeName} onChange={(e) => setCollegeName(e.target.value)} icon={<Sparkles size={16} />} /></div>
                <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} className="w-full rounded-xl border border-white/5 bg-[#0a0a0a] p-4 text-sm text-[#f8f6f3] outline-none" placeholder="Bio..." />
                <div className="flex justify-end gap-3 pt-4"><Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>Discard</Button><Button type="submit" isLoading={isSaving}>Save</Button></div>
              </form>
            ) : (
              <div className="flex flex-col h-full">
                <div className="grid grid-cols-2 gap-8 mb-10">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-[#8d807c]">BIO</p>
                    <p className="text-sm text-[#f8f6f3] bg-white/[0.02] p-4 rounded-xl border border-white/5 h-32 overflow-y-auto custom-scrollbar">{currentUser?.bio || "No bio yet."}</p>
                  </div>
                  <div className="space-y-4 pt-5">
                    <div className="flex items-center gap-3"><GitBranch size={18} className="text-[#8d807c]" /><div><p className="text-[10px] text-[#8d807c]">GITHUB</p><p className="text-sm font-bold text-[#f8f6f3]">{currentUser?.github_username || "Not linked"}</p></div></div>
                    <div className="flex items-center gap-3"><Sparkles size={18} className="text-[#8d807c]" /><div><p className="text-[10px] text-[#8d807c]">INSTITUTION</p><p className="text-sm font-bold text-[#f8f6f3]">{currentUser?.college_name || "Not specified"}</p></div></div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-8 border-t border-white/5 mt-auto">
                  <div className="flex gap-2">
                    <Button
                      onClick={() => { setDangerAction('reset'); setShowDangerModal(true); }}
                      variant="secondary"
                      className="h-7 px-2 text-[8px] uppercase tracking-widest border-[#edc390]/20 bg-[#edc390]/5 text-[#edc390] hover:bg-[#edc390]/10"
                    >
                      RESET DATA
                    </Button>
                    <Button
                      onClick={() => { setDangerAction('delete'); setShowDangerModal(true); }}
                      variant="danger"
                      className="h-7 px-2 text-[8px] uppercase tracking-widest"
                    >
                      DELETE ACCOUNT
                    </Button>
                  </div>
                  <div className="flex-1" />
                  <Button
                    onClick={handleLogout}
                    variant="danger"
                    className="h-7 px-2 text-[8px] uppercase tracking-widest opacity-60"
                  >
                    LOG OUT
                  </Button>
                </div>
              </div>
            )}
          </GlassCard></div>
        </div>
      )}

      {/* Danger Modal */}
      {showDangerModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-rise-in">
          <div className="w-full max-w-md">
            <GlassCard className="p-8 border-red-500/20 shadow-2xl relative">
              <button onClick={() => { setShowDangerModal(false); setDangerPassword(""); setDangerError(null); }} className="absolute right-6 top-6 text-[#8d807c] hover:text-[#f8f6f3]"><X size={20} /></button>

              <div className="text-center space-y-4 mb-8">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-red-500 mb-2">
                  <AlertTriangle size={32} />
                </div>
                <h2 className="text-2xl font-black text-[#f8f6f3]">
                  {dangerAction === 'delete' ? "Delete Identity?" : "Total Data Reset?"}
                </h2>
                <p className="text-sm text-[#8d807c]">
                  {dangerAction === 'delete'
                    ? "This will permanently erase your profile and all associated engineering telemetry. This action is irreversible."
                    : "This will wipe all projects, skills, and achievements. Your account and ID will remain, but you'll start from scratch."}
                </p>
              </div>

              <form onSubmit={handleDangerAction} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#8d807c] uppercase tracking-widest">Verify Password</label>
                  <input
                    type="password"
                    required
                    value={dangerPassword}
                    onChange={(e) => setDangerPassword(e.target.value)}
                    className="w-full rounded-xl border border-white/5 bg-[#0a0a0a] p-4 text-sm text-[#f8f6f3] outline-none focus:border-red-500/40 transition-colors"
                    placeholder="Enter your password to confirm..."
                  />
                  {dangerError && <p className="text-[10px] font-black text-red-500 uppercase mt-2">{dangerError}</p>}
                </div>

                <div className="flex gap-4">
                  <Button type="button" variant="ghost" className="flex-1" onClick={() => setShowDangerModal(false)}>Cancel</Button>
                  <Button
                    type="submit"
                    isLoading={isDangerLoading}
                    className={`flex-1 ${dangerAction === 'delete' ? 'bg-red-600 hover:bg-red-700' : 'bg-[#e7380d]'}`}
                  >
                    Confirm {dangerAction === 'delete' ? "Deletion" : "Reset"}
                  </Button>
                </div>
              </form>
            </GlassCard>
          </div>
        </div>
      )}

      {/* Modal - Add Project */}
      {showNewProjectModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-rise-in">
          <div className="w-full max-w-lg"><GlassCard className="p-6 relative">
            <button onClick={() => setShowNewProjectModal(false)} className="absolute right-4 top-4 text-[#8d807c] hover:text-[#f8f6f3]"><X size={20} /></button>
            <h2 className="text-xl font-black text-[#f8f6f3] mb-6 flex items-center gap-2"><Plus size={20} className="text-[#edc390]" /> Initialize Project</h2>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <Input label="Title" value={projectTitle} onChange={(e) => setProjectTitle(e.target.value)} required />
              <Input label="Tech (comma separated)" value={projectTech} onChange={(e) => setProjectTech(e.target.value)} placeholder="React, Tailwind, Node.js" />
              <Input label="GitHub Repository" value={projectGithub} onChange={(e) => setProjectGithub(e.target.value)} placeholder="https://github.com/username/repo" icon={<GitBranch size={16} />} />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><span className="text-xs font-bold uppercase text-[#8d807c]">Status</span><select value={projectStatus} onChange={(e) => setProjectStatus(e.target.value)} className="w-full rounded-lg border border-white/5 bg-[#0a0a0a] p-3 text-sm text-[#f8f6f3]"><option value="PLANNING">Planning</option><option value="IN_PROGRESS">In Progress</option><option value="COMPLETED">Completed</option></select></div>
                <div className="space-y-2"><span className="text-xs font-bold uppercase text-[#8d807c]">Difficulty</span><select value={projectDifficulty} onChange={(e) => setProjectDifficulty(e.target.value)} className="w-full rounded-lg border border-white/5 bg-[#0a0a0a] p-3 text-sm text-[#f8f6f3]"><option value="BEGINNER">Beginner</option><option value="INTERMEDIATE">Intermediate</option><option value="ADVANCED">Advanced</option></select></div>
              </div>
              <textarea value={projectDesc} onChange={(e) => setProjectDesc(e.target.value)} rows={3} className="w-full rounded-lg border border-white/5 bg-[#0a0a0a] p-3 text-sm text-[#f8f6f3]" placeholder="Summary..." />
              <div className="pt-4 flex justify-end gap-3"><Button type="button" variant="ghost" onClick={() => setShowNewProjectModal(false)}>Cancel</Button><Button type="submit" isLoading={isCreatingProject}>Create</Button></div>
            </form></GlassCard></div>
        </div>
      )}

      {/* Modal - Project Detail / Edit */}
      {selectedProject && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-rise-in">
          <div className="w-full max-w-2xl">
            <GlassCard className="p-8 relative overflow-hidden border-[#edc390]/20 shadow-2xl">
              <button
                onClick={() => { setSelectedProject(null); setIsEditingProjectModal(false); }}
                className="absolute right-6 top-6 text-[#8d807c] hover:text-[#f8f6f3] z-10"
              >
                <X size={24} />
              </button>

              {!isEditingProjectModal ? (
                <div className="space-y-8">
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/5">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black text-[#e7380d] uppercase tracking-widest bg-[#e7380d]/10 px-2 py-0.5 rounded">{selectedProject.difficulty}</span>
                        <span className="text-[10px] font-black text-[#edc390] uppercase tracking-widest bg-[#edc390]/10 px-2 py-0.5 rounded">{selectedProject.status}</span>
                      </div>
                      <h2 className="text-3xl font-black text-[#f8f6f3] leading-tight">{selectedProject.title}</h2>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="text-[10px] font-black text-[#8d807c] uppercase tracking-widest">Progress</div>
                      <div className="flex items-center gap-3">
                        <div className="w-32 h-2 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-[#e7380d] to-[#edc390]" style={{ width: `${selectedProject.progress_percentage}%` }} />
                        </div>
                        <span className="text-xl font-black text-[#f8f6f3]">{selectedProject.progress_percentage}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-black text-[#8d807c] uppercase flex items-center gap-2"><Info size={12} /> Narrative Description</h4>
                        <p className="text-sm text-[#f8f6f3] leading-relaxed bg-white/[0.02] p-6 rounded-2xl border border-white/5 h-48 overflow-y-auto custom-scrollbar">
                          {selectedProject.description}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-black text-[#8d807c] uppercase">Stack Engine</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedProject.tech_stack?.split(/[ ,.\/]+/).filter(Boolean).map((tech, i) => (
                            <span key={i} className="text-xs font-bold text-[#edc390] bg-[#edc390]/5 px-3 py-1.5 rounded border border-[#edc390]/10">#{tech}</span>
                          ))}
                        </div>
                      </div>

                      {selectedProject.github_url && (
                        <div className="space-y-2">
                          <h4 className="text-[10px] font-black text-[#8d807c] uppercase">Source Code</h4>
                          <a
                            href={selectedProject.github_url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-3 bg-white/[0.03] p-4 rounded-xl border border-white/5 hover:bg-white/[0.05] transition-colors group"
                          >
                            <GithubIcon size={20} className="text-[#8d807c] group-hover:text-white" />
                            <span className="text-xs font-bold text-[#f8f6f3] truncate">{selectedProject.github_url}</span>
                            <ExternalLink size={14} className="ml-auto text-[#8d807c]" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-8 flex items-center justify-between border-t border-white/5">
                    <div className="text-[10px] font-black text-[#8d807c] uppercase flex items-center gap-2">
                      <Calendar size={14} /> INITIALIZED ON {new Date(selectedProject.created_at).toLocaleDateString()}
                    </div>
                    <div className="flex gap-3">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setProjectTitle(selectedProject.title);
                          setProjectDesc(selectedProject.description);
                          setProjectTech(selectedProject.tech_stack);
                          setProjectGithub(selectedProject.github_url || "");
                          setProjectStatus(selectedProject.status);
                          setProjectDifficulty(selectedProject.difficulty);
                          setProjectProgress(selectedProject.progress_percentage);
                          setIsEditingProjectModal(true);
                        }}
                      >
                        Edit Details
                      </Button>
                      <Button onClick={() => { setSelectedProject(null); setIsEditingProjectModal(false); }}>Close</Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <h2 className="text-xl font-black text-[#f8f6f3] mb-6 flex items-center gap-2"><Sparkles size={20} className="text-[#edc390]" /> Edit Project Narrative</h2>
                  <form onSubmit={handleUpdateProject} className="space-y-4">
                    <Input label="Title" value={projectTitle} onChange={(e) => setProjectTitle(e.target.value)} required />
                    <div className="grid grid-cols-2 gap-4">
                      <Input label="Tech Stack" value={projectTech} onChange={(e) => setProjectTech(e.target.value)} />
                      <div className="space-y-2">
                        <span className="text-xs font-bold uppercase text-[#8d807c]">Progress ({projectProgress}%)</span>
                        <input
                          type="range"
                          min="0" max="100"
                          value={projectProgress}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            setProjectProgress(val);
                            if (val === 0) setProjectStatus("PLANNING");
                            else if (val === 100) setProjectStatus("COMPLETED");
                            else setProjectStatus("IN_PROGRESS");
                          }}
                          className="w-full h-2 bg-white/5 rounded-lg appearance-none cursor-pointer accent-[#edc390]"
                        />
                      </div>
                    </div>
                    <Input label="GitHub URL" value={projectGithub} onChange={(e) => setProjectGithub(e.target.value)} icon={<GitBranch size={16} />} />
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2"><span className="text-xs font-bold uppercase text-[#8d807c]">Status</span><select value={projectStatus} onChange={(e) => setProjectStatus(e.target.value)} className="w-full rounded-lg border border-white/5 bg-[#0a0a0a] p-3 text-sm text-[#f8f6f3]"><option value="PLANNING">Planning</option><option value="IN_PROGRESS">In Progress</option><option value="COMPLETED">Completed</option></select></div>
                      <div className="space-y-2"><span className="text-xs font-bold uppercase text-[#8d807c]">Difficulty</span><select value={projectDifficulty} onChange={(e) => setProjectDifficulty(e.target.value)} className="w-full rounded-lg border border-white/5 bg-[#0a0a0a] p-3 text-sm text-[#f8f6f3]"><option value="BEGINNER">Beginner</option><option value="INTERMEDIATE">Intermediate</option><option value="ADVANCED">Advanced</option></select></div>
                    </div>
                    <textarea value={projectDesc} onChange={(e) => setProjectDesc(e.target.value)} rows={4} className="w-full rounded-lg border border-white/5 bg-[#0a0a0a] p-3 text-sm text-[#f8f6f3]" placeholder="Update description..." />
                    <div className="pt-4 flex justify-end gap-3">
                      <Button type="button" variant="ghost" onClick={() => setIsEditingProjectModal(false)}>Cancel</Button>
                      <Button type="submit" isLoading={isCreatingProject}>Save Updates</Button>
                    </div>
                  </form>
                </div>
              )}
            </GlassCard>
          </div>
        </div>
      )}
      {/* Modal - Add Skill */}
      {showAddSkillModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-rise-in">
          <div className="w-full max-w-lg">
            <GlassCard className="p-6 relative">
              <button onClick={() => setShowAddSkillModal(false)} className="absolute right-4 top-4 text-[#8d807c] hover:text-[#f8f6f3]"><X size={20} /></button>
              <h2 className="text-xl font-black text-[#f8f6f3] mb-6 flex items-center gap-2"><Sparkles size={20} className="text-[#edc390]" /> Add Engineering Skill</h2>
              <form onSubmit={handleAddSkill} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Skill Name" value={skillInputName} onChange={(e) => setSkillInputName(e.target.value)} placeholder="React, AWS..." required />
                  <Input label="Category" value={skillCategory} onChange={(e) => setSkillCategory(e.target.value)} placeholder="Frontend, Cloud..." />
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <Input label="Started Learning Date" type="date" value={skillStartedDate} onChange={(e) => setSkillStartedDate(e.target.value)} required />
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <Input label="Initial Practice Hours" type="number" value={skillInitialHours} onChange={(e) => setSkillInitialHours(e.target.value)} min="0" />
                </div>
                <textarea value={skillDescription} onChange={(e) => setSkillDescription(e.target.value)} rows={3} className="w-full rounded-lg border border-white/5 bg-[#0a0a0a] p-3 text-sm text-[#f8f6f3]" placeholder="Narrative/Description..." />
                {skillError && <p className="text-red-400 text-xs">{skillError}</p>}
                <div className="pt-4 flex justify-end gap-3"><Button type="button" variant="ghost" onClick={() => setShowAddSkillModal(false)}>Cancel</Button><Button type="submit" isLoading={isAddingSkill} disabled={!skillInputName.trim()}>Add to Workspace</Button></div>
              </form>
            </GlassCard>
          </div>
        </div>
      )}

      {/* Modal - Badge Details */}
      {selectedBadgeDetails && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 animate-rise-in">
          <div className="w-full max-w-md">
            <GlassCard className="p-8 relative border-[#edc390]/20 shadow-2xl">
              <button
                onClick={() => setSelectedBadgeDetails(null)}
                className="absolute right-6 top-6 text-[#8d807c] hover:text-[#f8f6f3]"
              >
                <X size={20} />
              </button>

              <div className="flex flex-col items-center text-center">
                <div className="h-24 w-24 rounded-full bg-[#edc390]/10 border-2 border-[#edc390]/30 flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(237,195,144,0.1)]">
                  {selectedBadgeDetails.icon_name === 'Zap' && <Zap size={48} className="text-[#edc390]" />}
                  {selectedBadgeDetails.icon_name === 'Layers' && <Layers size={48} className="text-[#edc390]" />}
                  {selectedBadgeDetails.icon_name === 'Crown' && <Crown size={48} className="text-[#edc390]" />}
                  {selectedBadgeDetails.icon_name === 'Flame' && <Flame size={48} className="text-[#e7380d]" />}
                  {selectedBadgeDetails.icon_name === 'Trophy' && <Trophy size={48} className="text-[#edc390]" />}
                  {selectedBadgeDetails.icon_name === 'Box' && <Box size={48} className="text-[#505b90]" />}
                  {selectedBadgeDetails.icon_name === 'Sparkles' && <Sparkles size={48} className="text-[#edc390]" />}
                  {selectedBadgeDetails.icon_name === 'Package' && <Package size={48} className="text-[#c66b3b]" />}
                  {selectedBadgeDetails.icon_name === 'Terminal' && <Terminal size={48} className="text-green-400" />}
                  {selectedBadgeDetails.icon_name === 'BookOpen' && <BookOpen size={48} className="text-[#505b90]" />}
                  {selectedBadgeDetails.icon_name === 'GitBranch' && <GitBranch size={48} className="text-[#edc390]" />}
                </div>

                <h2 className="text-2xl font-black text-[#f8f6f3] mb-2">{selectedBadgeDetails.name}</h2>
                <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black text-[#8d807c] uppercase tracking-widest mb-6">
                  {selectedBadgeDetails.rarity} • {selectedBadgeDetails.category}
                </span>

                <p className="text-sm text-[#8d807c] leading-relaxed mb-8">
                  {selectedBadgeDetails.description}
                </p>

                <div className="w-full bg-white/5 rounded-2xl p-6 border border-white/5">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-black text-[#8d807c] uppercase tracking-widest">Progress to Unlock</span>
                    <span className="text-xs font-black text-[#edc390]">{selectedBadgeDetails.progress.percentage}%</span>
                  </div>
                  <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden mb-4">
                    <div
                      className="h-full bg-gradient-to-r from-[#edc390] to-[#c66b3b] transition-all duration-1000"
                      style={{ width: `${selectedBadgeDetails.progress.percentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-black text-[#8d807c] uppercase">
                    <span>{selectedBadgeDetails.progress.current} / {selectedBadgeDetails.progress.target}</span>
                    <span className="text-white/60">{selectedBadgeDetails.progress.requirement}</span>
                  </div>
                </div>

                <div className="mt-8 w-full flex gap-3">
                  <Button
                    variant="ghost"
                    className="flex-1"
                    onClick={() => setSelectedBadgeDetails(null)}
                  >
                    Close
                  </Button>
                  {selectedBadgeDetails.awarded_at && (
                    <Button
                      variant={selectedBadgeDetails.is_showcased ? 'danger' : 'primary'}
                      className="flex-1"
                      onClick={() => {
                        handleToggleShowcase(selectedBadgeDetails.id);
                        setSelectedBadgeDetails(null);
                      }}
                      isLoading={isTogglingShowcase}
                    >
                      {selectedBadgeDetails.is_showcased ? 'Remove from Gallery' : 'Showcase in Gallery'}
                    </Button>
                  )}
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      )}

      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />

      {/* Modal - Streak Narrative */}
      {showStreakModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-rise-in">
          <div className="w-full max-w-4xl">
            <GlassCard className="p-8 relative border-[#e7380d]/20 shadow-2xl overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5 text-[#e7380d] pointer-events-none"><Flame size={120} /></div>

              <button
                onClick={() => setShowStreakModal(false)}
                className="absolute right-6 top-6 text-[#8d807c] hover:text-[#f8f6f3] z-[60] cursor-pointer"
              >
                <X size={24} />
              </button>

              <div className="mb-10 relative z-10 pr-16">
                <h2 className="text-3xl font-black text-[#f8f6f3] flex items-center gap-3">
                  <Flame className="text-[#e7380d]" size={32} />
                  Streak Narrative
                </h2>
                <p className="text-[#8d807c] mt-1 uppercase text-[10px] font-black tracking-widest">Historical Consistency Log</p>
              </div>

              <div className="space-y-10 max-h-[60vh] overflow-y-auto pr-4 scrollbar-none">
                {(() => {
                  if (!heatmapResource.data) return <div className="text-center py-20 text-[#8d807c]">Initializing Telemetry...</div>;

                  const getLocalDateString = (date) => {
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    return `${year}-${month}-${day}`;
                  };

                  const today = new Date();
                  const todayStr = getLocalDateString(today);
                  const activityMap = heatmapResource.data.reduce((acc, curr) => {
                    acc[curr.date] = curr.count;
                    return acc;
                  }, {});

                  const allDays = [];
                  for (let i = -15; i <= 30; i++) {
                    const d = new Date(today);
                    d.setDate(today.getDate() + i);
                    const dateStr = getLocalDateString(d);
                    allDays.push({
                      date: dateStr,
                      count: activityMap[dateStr] || 0,
                      isFuture: d > today && dateStr !== todayStr,
                      isToday: dateStr === todayStr
                    });
                  }

                  const grouped = allDays.reduce((acc, curr) => {
                    const year = new Date(curr.date.replace(/-/g, '/')).getFullYear();
                    if (!acc[year]) acc[year] = [];
                    acc[year].push(curr);
                    return acc;
                  }, {});

                  return Object.keys(grouped).sort((a, b) => b - a).map(year => (
                    <div key={year} className="space-y-4">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-black text-[#8d807c] uppercase tracking-[0.2em]">{year}</span>
                        <div className="flex-1 h-[1px] bg-white/5" />
                      </div>

                      <div className="flex gap-2 overflow-x-auto pb-6 pt-6 scrollbar-none">
                        {grouped[year].map((day, i) => (
                          <div
                            key={i}
                            ref={day.isToday ? todayRef : null}
                            className={`shrink-0 w-20 p-4 rounded-xl border transition-all relative flex flex-col items-center justify-center ${day.isToday ? 'border-[#edc390]/50 bg-[#edc390]/5' : 'border-white/5 bg-white/[0.01]'
                              }`}
                          >
                            {day.isToday && (
                              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-[#edc390] text-black text-[7px] font-black rounded-sm uppercase tracking-tighter z-20">
                                Now
                              </span>
                            )}
                            <span className="text-[9px] font-black uppercase tracking-widest text-[#8d807c]">
                              {new Date(day.date.replace(/-/g, '/')).toLocaleDateString(undefined, { month: 'short' })}
                            </span>
                            <span className="text-xl font-black text-[#f8f6f3] my-1">
                              {new Date(day.date.replace(/-/g, '/')).getDate()}
                            </span>
                            <div className={`h-1 w-1 rounded-full ${day.count > 0 ? 'bg-green-400 shadow-[0_0_8px_#4ade80]' : (day.isFuture ? 'bg-white/10' : 'bg-red-400/50')
                              }`} />
                          </div>
                        ))}
                      </div>
                    </div>
                  ));
                })()}
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-between gap-6 pt-6 border-t border-white/5">
                <div className="flex flex-wrap items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-400" />
                    <span className="text-[9px] font-black text-[#8d807c] uppercase tracking-wider">Streaked</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-red-400/50" />
                    <span className="text-[9px] font-black text-[#8d807c] uppercase tracking-wider">Missed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-white/10" />
                    <span className="text-[9px] font-black text-[#8d807c] uppercase tracking-wider">Upcoming</span>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      )}

      {renderProfilePreviewModal()}
      {showCropper && (
        <ImageCropper 
          image={imageToCrop} 
          onCropComplete={handleCropComplete} 
          onCancel={() => { setShowCropper(false); setImageToCrop(null); }} 
        />
      )}
    </DashboardLayout>
  );
}

export default DashboardPage;
