import { Badge } from '../../components/ui/Badge';
import { Trophy, Star, Target, CheckCircle, Clock, Award } from 'lucide-react';


export function AchievementBadges({ completedSteps, totalPoints, className = '' }) {
  const achievements = [
    {
      id: 'first_step',
      title: 'Getting Started',
      description: 'Completed your first step',
      icon: Target,
      color: 'bg-blue-100 text-blue-700 border-blue-200',
      earned: completedSteps.length >= 1
    },
    {
      id: 'halfway',
      title: 'Halfway There',
      description: 'Completed 3 assessment steps',
      icon: Star,
      color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      earned: completedSteps.length >= 3
    },
    {
      id: 'credential_master',
      title: 'Credential Master',
      description: 'Completed credential comparison',
      icon: Trophy,
      color: 'bg-purple-100 text-purple-700 border-purple-200',
      earned: completedSteps.includes('credentials')
    },
    {
      id: 'assessment_complete',
      title: 'Assessment Expert',
      description: 'Completed all assessment steps',
      icon: Award,
      color: 'bg-green-100 text-green-700 border-green-200',
      earned: completedSteps.length >= 6
    },
    {
      id: 'point_collector',
      title: 'Point Collector',
      description: 'Earned 50+ points',
      icon: CheckCircle,
      color: 'bg-orange-100 text-orange-700 border-orange-200',
      earned: totalPoints >= 50
    }
  ];

  const earnedAchievements = achievements.filter(a => a.earned);

  if (earnedAchievements.length === 0) {
    return null;
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <Trophy className="h-4 w-4 text-yellow-500" />
        Achievements Unlocked
      </h3>
      <div className="flex flex-wrap gap-2">
        {earnedAchievements.map((achievement) => {
          const IconComponent = achievement.icon;
          return (
            <Badge 
              key={achievement.id}
              variant="outline" 
              className={`${achievement.color} text-xs px-2 py-1 flex items-center gap-1`}
            >
              <IconComponent className="h-3 w-3" />
              {achievement.title}
            </Badge>
          );
        })}
      </div>
      <p className="text-xs text-gray-600 mt-2">
        {earnedAchievements.length} of {achievements.length} achievements earned
      </p>
    </div>
  );
}