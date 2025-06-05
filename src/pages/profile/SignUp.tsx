import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../../store/index';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { RadioGroup, RadioGroupItem } from '../../components/ui/RadioGroup';
import { Label } from '../../components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/Select';
import type { UserRole, SeniorityLevel } from '@/types';
import { toast } from 'react-hot-toast';

type CapacityType = 'fulltime' | 'parttime';

export default function SignUp() {
  const navigate = useNavigate();
  const signUp = useStore((state) => state.signUp);
  const fetchEngineers = useStore((state) => state.fetchEngineers);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('engineer');
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [department, setDepartment] = useState('');
  const [seniority, setSeniority] = useState<SeniorityLevel>('mid');
  const [capacityType, setCapacityType] = useState<CapacityType>('fulltime');
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSkillInput(value);
    
    if (value.trim()) {
      const skillsArray = value.split(',')
        .map(skill => skill.trim())
        .filter(skill => skill.length > 0);
      setSkills(skillsArray);
    } else {
      setSkills([]);
    }
  };

  const handleSkillAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (skillInput.trim()) {
        const newSkills = [...skills];
        const skillsToAdd = skillInput.split(',')
          .map(skill => skill.trim())
          .filter(skill => skill.length > 0);
        
        skillsToAdd.forEach(skill => {
          if (!newSkills.includes(skill)) {
            newSkills.push(skill);
          }
        });
        
        setSkills(newSkills);
        setSkillInput('');
      }
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  // Client-side validation
  const validateForm = () => {
    const newErrors: typeof errors = {};
    
    // Email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      newErrors.password = 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number';
    }

    // Required fields validation
    if (!name.trim()) {
      newErrors.general = 'Name is required';
    }

    if (role === 'engineer' && skills.length === 0) {
      newErrors.general = 'Please add at least one skill';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const maxCapacity = capacityType === "fulltime" ? 100 : 50;

      await signUp(
        name,
        email,
        password,
        role,
        skills,
        department,
        seniority,
        maxCapacity
      );
      
      await fetchEngineers();
      toast.success('Account created successfully!');
      navigate("/login");
    } catch (err: any) {
      console.error('Signup Error:', err);
      const errorMessage = err.response?.data?.message || 'Failed to create account';
      setErrors({
        general: errorMessage
      });
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Create an Account
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md ${errors.email ? 'border-red-500' : ''}`}
                required
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md ${errors.password ? 'border-red-500' : ''}`}
                required
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password}</p>
              )}
              
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <RadioGroup
                value={role}
                onValueChange={(value) => setRole(value as UserRole)}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="engineer" id="engineer" />
                  <Label htmlFor="engineer">Engineer</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="manager" id="manager" />
                  <Label htmlFor="manager">Manager</Label>
                </div>
              </RadioGroup>
            </div>
            {role === 'engineer' && (
              <>
                <div className="space-y-2">
                  <Label>Capacity</Label>
                  <RadioGroup
                    value={capacityType}
                    onValueChange={(value) => setCapacityType(value as CapacityType)}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="fulltime" id="fulltime" />
                      <Label htmlFor="fulltime">Full Time (100%)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="parttime" id="parttime" />
                      <Label htmlFor="parttime">Part Time (50%)</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="skills">
                    Skills <span className="text-red-500">*</span>
                  </Label>
                  <input
                    id="skills"
                    type="text"
                    value={skillInput}
                    onChange={handleSkillsChange}
                    onKeyDown={handleSkillAdd}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="Type skills and press Enter (comma separated)"
                  />
                  {skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {skills.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            className="ml-1 text-blue-600 hover:text-blue-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <input
                    id="department"
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                    placeholder="e.g., Frontend, Backend, DevOps"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seniority">Seniority Level</Label>
                  <Select value={seniority} onValueChange={(value) => setSeniority(value as SeniorityLevel)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select seniority level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="junior">Junior</SelectItem>
                      <SelectItem value="mid">Mid-Level</SelectItem>
                      <SelectItem value="senior">Senior</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
            {errors.general && (
              <p className="text-sm text-red-600">{errors.general}</p>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || (role === 'engineer' && skills.length === 0)}
            >
              {isLoading ? 'Creating account...' : 'Create account'}
            </Button>
            <div className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-blue-600 hover:underline">
                Sign in
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 