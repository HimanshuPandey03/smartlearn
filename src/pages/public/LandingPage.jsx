import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Monitor, Award, TrendingUp, CheckCircle, ArrowRight } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

const LandingPage = () => {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-blue-50 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-secondary leading-tight">
              Learn. Practice. <span className="text-primary">Grow.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-2xl">
              Empowering students with digital literacy, MS-CIT preparation, and workplace readiness through structured learning, practice tests, and progress tracking.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link to="/register">
                <Button size="lg" className="w-full sm:w-auto flex items-center justify-center gap-2">
                  Get Started <ArrowRight size={20} />
                </Button>
              </Link>
              <Link to="/about">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Explore Learning
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex-1 w-full max-w-lg md:max-w-none">
            <div className="aspect-video bg-slate-200 rounded-2xl shadow-xl overflow-hidden relative flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-indigo-100 opacity-50"></div>
              <Monitor size={80} className="text-primary opacity-80" />
            </div>
          </div>
        </div>
      </section>

      {/* Learning Modules Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-secondary mb-4">Comprehensive Learning Modules</h2>
            <p className="text-slate-600">Everything you need to master digital skills and prepare for your future career.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-8 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 text-primary rounded-xl flex items-center justify-center mb-6">
                <Monitor size={24} />
              </div>
              <h3 className="text-xl font-bold text-secondary mb-3">Digital Literacy & MS-CIT</h3>
              <p className="text-slate-600">Complete curriculum to prepare for MKCL's MS-CIT examination with interactive lessons.</p>
            </Card>
            <Card className="p-8 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-amber-100 text-accent rounded-xl flex items-center justify-center mb-6">
                <BookOpen size={24} />
              </div>
              <h3 className="text-xl font-bold text-secondary mb-3">Computer Fundamentals</h3>
              <p className="text-slate-600">Build a strong foundation in computer hardware, software, and basic troubleshooting.</p>
            </Card>
            <Card className="p-8 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-100 text-success rounded-xl flex items-center justify-center mb-6">
                <Award size={24} />
              </div>
              <h3 className="text-xl font-bold text-secondary mb-3">Employability & Soft Skills</h3>
              <p className="text-slate-600">Develop communication, presentation, and workplace skills essential for career success.</p>
            </Card>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-secondary mb-4">How SmartLearn Works</h2>
            <p className="text-slate-600">A structured path to skill mastery designed specifically for students.</p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center text-xl font-bold text-primary mb-4 border-2 border-blue-100">1</div>
              <h4 className="font-bold text-lg mb-2">Learn</h4>
              <p className="text-slate-600 text-sm">Access structured modules and engaging content.</p>
            </div>
            <div className="text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center text-xl font-bold text-primary mb-4 border-2 border-blue-100">2</div>
              <h4 className="font-bold text-lg mb-2">Practice</h4>
              <p className="text-slate-600 text-sm">Apply concepts through assignments and exercises.</p>
            </div>
            <div className="text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center text-xl font-bold text-primary mb-4 border-2 border-blue-100">3</div>
              <h4 className="font-bold text-lg mb-2">Test</h4>
              <p className="text-slate-600 text-sm">Take quizzes and mock tests to assess knowledge.</p>
            </div>
            <div className="text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center text-xl font-bold text-primary mb-4 border-2 border-blue-100">4</div>
              <h4 className="font-bold text-lg mb-2">Track</h4>
              <p className="text-slate-600 text-sm">Monitor progress and identify areas for improvement.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Target Audiences */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-secondary mb-6">Designed for Mobile-First Learning</h2>
              <p className="text-slate-600 mb-6 text-lg">
                We understand that many students access educational content primarily through smartphones. That's why SmartLearn is fully optimized for mobile devices.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle className="text-success mt-1" size={20} />
                  <span className="text-slate-700">Responsive layouts that work on any screen size</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="text-success mt-1" size={20} />
                  <span className="text-slate-700">Touch-friendly navigation and intuitive controls</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="text-success mt-1" size={20} />
                  <span className="text-slate-700">Clear typography and accessible design elements</span>
                </li>
              </ul>
            </div>
            <div className="bg-slate-100 p-8 rounded-2xl">
              <h3 className="text-2xl font-bold text-secondary mb-4">Teacher & Mentor Support</h3>
              <p className="text-slate-600 mb-6">
                Education isn't just about self-study. SmartLearn provides comprehensive tools for teachers to guide their students to success.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <TrendingUp className="text-primary mt-1" size={20} />
                  <span className="text-slate-700">Real-time monitoring of student progress</span>
                </li>
                <li className="flex items-start gap-3">
                  <TrendingUp className="text-primary mt-1" size={20} />
                  <span className="text-slate-700">Detailed analytics on quiz and assignment performance</span>
                </li>
                <li className="flex items-start gap-3">
                  <TrendingUp className="text-primary mt-1" size={20} />
                  <span className="text-slate-700">Ability to provide targeted feedback to students requiring attention</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to start your learning journey?</h2>
          <p className="text-blue-100 mb-8 text-lg">Join Matrubhoomi School's digital learning initiative today.</p>
          <Link to="/register">
            <Button variant="white" size="lg" className="font-bold px-8">
              Create Your Account
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
