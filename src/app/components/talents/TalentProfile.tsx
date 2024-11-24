interface TalentProfileProps {
    talent: {
      id: string;
      name: string;
      title: string;
      skills: string[];
      hourlyRate: number;
      currency: string;
      rating: number;
      completedJobs: number;
      avatar: string;
      availability: string;
      bio?: string;
      experience?: {
        company: string;
        role: string;
        duration: string;
      }[];
      education?: {
        institution: string;
        degree: string;
        year: string;
      }[];
      email?: string;
      calendlyUrl?: string;
    };
    onClose: () => void;
  }
  
  export const TalentProfile = ({ talent, onClose }: TalentProfileProps) => {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <img
            src={talent.avatar}
            alt={talent.name}
            className="w-20 h-20 rounded-full object-cover"
          />
          <div>
            <h2 className="text-2xl font-semibold">{talent.name}</h2>
            <p className="text-lg text-gray-600">{talent.title}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm">★ {talent.rating}</span>
              <span className="text-sm text-gray-600">
                ({talent.completedJobs} jobs completed)
              </span>
            </div>
          </div>
        </div>
  
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">About</h3>
            <p className="text-gray-600">
              {talent.bio || "Experienced developer with a passion for creating efficient and scalable solutions."}
            </p>
          </div>
  
          <div>
            <h3 className="text-lg font-semibold mb-2">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {talent.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 bg-gray-100 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
  
          <div>
            <h3 className="text-lg font-semibold mb-2">Experience</h3>
            <div className="space-y-4">
              {(talent.experience || [
                {
                  company: "Tech Corp",
                  role: "Senior Developer",
                  duration: "2020 - Present"
                }
              ]).map((exp, index) => (
                <div key={index} className="border-l-2 border-gray-200 pl-4">
                  <h4 className="font-medium">{exp.role}</h4>
                  <p className="text-gray-600">{exp.company}</p>
                  <p className="text-sm text-gray-500">{exp.duration}</p>
                </div>
              ))}
            </div>
          </div>
  
          <div>
            <h3 className="text-lg font-semibold mb-2">Education</h3>
            <div className="space-y-4">
              {(talent.education || [
                {
                  institution: "University of Technology",
                  degree: "BS in Computer Science",
                  year: "2019"
                }
              ]).map((edu, index) => (
                <div key={index} className="border-l-2 border-gray-200 pl-4">
                  <h4 className="font-medium">{edu.degree}</h4>
                  <p className="text-gray-600">{edu.institution}</p>
                  <p className="text-sm text-gray-500">{edu.year}</p>
                </div>
              ))}
            </div>
          </div>
  
          <div className="flex gap-4">
            <a
              href={`mailto:${talent.email || 'contact@example.com'}`}
              className="flex-1 btn-secondary flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              Email
            </a>
            <a
              href={talent.calendlyUrl || 'https://calendly.com'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 btn-secondary flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              Schedule Call
            </a>
          </div>
  
          <div className="pt-4 border-t">
            <button
              onClick={onClose}
              className="w-full btn-primary"
            >
              Close Profile
            </button>
          </div>
        </div>
      </div>
    );
  };