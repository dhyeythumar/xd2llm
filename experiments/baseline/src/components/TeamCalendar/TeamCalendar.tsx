import './TeamCalendar.css';

type Task = {
    title: string;
    client: string;
    startDay: number;
    endDay: number;
    color: 'purple' | 'gray' | 'orange' | 'coral';
};

type TeamMember = {
    name: string;
    role: string;
    avatar: string;
    tasks: Task[];
};

const DAYS = [23, 24, 25, 26, 27, 28, 29, 30, 31, 1, 2, 3];
const CURRENT_DAY = 2;

const TEAM_MEMBERS: TeamMember[] = [
    {
        name: 'Marvin McKinney',
        role: 'Marketing Manager',
        avatar: '/img-7.png',
        tasks: [
            {
                title: "Champion's league Campaign",
                client: 'Crayon Labs',
                startDay: 23,
                endDay: 28,
                color: 'purple',
            },
            {
                title: 'UFC Website Promo..',
                client: 'Fantasy',
                startDay: 25,
                endDay: 28,
                color: 'gray',
            },
            {
                title: 'Oreo Treat..',
                client: 'Britania',
                startDay: 1,
                endDay: 3,
                color: 'orange',
            },
        ],
    },
    {
        name: 'Eleanor Pena',
        role: 'Senior Developer',
        avatar: '/img-8.png',
        tasks: [
            {
                title: 'Front end- Website',
                client: 'Uber Go',
                startDay: 25,
                endDay: 28,
                color: 'coral',
            },
            {
                title: 'Online Courses Page',
                client: 'Fantasy',
                startDay: 30,
                endDay: 3,
                color: 'purple',
            },
            {
                title: 'Mobile App Rework',
                client: 'Crayon Labs',
                startDay: 27,
                endDay: 3,
                color: 'gray',
            },
        ],
    },
    {
        name: 'Kathryn Murphy',
        role: 'Lead Designer',
        avatar: '/img-9.png',
        tasks: [
            {
                title: 'Landing Page D..',
                client: 'Uber Go',
                startDay: 25,
                endDay: 28,
                color: 'gray',
            },
        ],
    },
];

function getDayIndex(day: number): number {
    return DAYS.indexOf(day);
}

function getTaskStyle(task: Task) {
    const startIndex = getDayIndex(task.startDay);
    const endIndex = getDayIndex(task.endDay);
    const span = endIndex - startIndex + 1;

    return {
        gridColumnStart: startIndex + 1,
        gridColumnEnd: `span ${span}`,
    };
}

export function TeamCalendar() {
    return (
        <section className="team-calendar">
            <div className="calendar-container">
                {/* Header Row */}
                <div className="calendar-header">
                    <div className="header-spacer"></div>
                    <div className="days-header">
                        {DAYS.map((day, index) => (
                            <div key={index} className={`day-header ${day === CURRENT_DAY ? 'current' : ''}`}>
                                {day === 1 && <span className="month-label">Dec</span>}
                                {day === CURRENT_DAY ? (
                                    <span className="current-day-badge">{day}</span>
                                ) : (
                                    <span className="day-number">{day}</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Team Rows */}
                {TEAM_MEMBERS.map((member, memberIndex) => (
                    <div key={memberIndex} className="team-row">
                        <div className="member-info">
                            <div className="member-avatar">
                                <img src={member.avatar} alt={member.name} />
                            </div>
                            <div className="member-details">
                                <span className="member-name">{member.name}</span>
                                <span className="member-role">{member.role}</span>
                            </div>
                        </div>
                        <div className="tasks-grid">
                            {/* Vertical grid lines */}
                            {DAYS.map((day, index) => (
                                <div
                                    key={index}
                                    className={`grid-line ${day === CURRENT_DAY ? 'current' : ''}`}
                                    style={{ gridColumn: index + 1 }}
                                />
                            ))}
                            {/* Task bars */}
                            {member.tasks.map((task, taskIndex) => (
                                <div
                                    key={taskIndex}
                                    className={`task-bar task-${task.color}`}
                                    style={getTaskStyle(task)}
                                >
                                    <span className="task-title">{task.title}</span>
                                    <span className="task-client">{task.client}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
