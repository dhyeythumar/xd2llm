import './CalendarView.css';

type TeamMember = {
    id: string;
    name: string;
    role: string;
    avatarUrl: string;
};

type Task = {
    id: string;
    memberId: string;
    title: string;
    client: string;
    startDay: number;
    duration: number;
    progress: number; // 0-100
    color: 'purple' | 'orange' | 'coral' | 'gray' | 'violet';
};

const TEAM_MEMBERS: TeamMember[] = [
    { id: '1', name: 'Marvin McKinney', role: 'Marketing Manager', avatarUrl: '/img-1.png' },
    { id: '2', name: 'Eleanor Pena', role: 'Senior Developer', avatarUrl: '/img-2.png' },
    { id: '3', name: 'Kathryn Murphy', role: 'Lead Designer', avatarUrl: '/img-3.png' },
];

const TASKS: Task[] = [
    {
        id: '1',
        memberId: '1',
        title: "Champion's league Campaign",
        client: 'Crayon Labs',
        startDay: 23,
        duration: 6,
        progress: 93,
        color: 'purple',
    },
    {
        id: '2',
        memberId: '1',
        title: 'UFC Website Promo..',
        client: 'Fantasy',
        startDay: 26,
        duration: 3,
        progress: 100,
        color: 'gray',
    },
    {
        id: '3',
        memberId: '1',
        title: 'Oreo Treat..',
        client: 'Britania',
        startDay: 31,
        duration: 2,
        progress: 77,
        color: 'orange',
    },
    {
        id: '4',
        memberId: '2',
        title: 'Front end- Website',
        client: 'Uber Go',
        startDay: 25,
        duration: 3,
        progress: 84,
        color: 'coral',
    },
    {
        id: '5',
        memberId: '2',
        title: 'Online Courses Page',
        client: 'Fantasy',
        startDay: 30,
        duration: 4,
        progress: 100,
        color: 'violet',
    },
    {
        id: '6',
        memberId: '2',
        title: 'Mobile App Rework',
        client: 'Crayon Labs',
        startDay: 27,
        duration: 7,
        progress: 63,
        color: 'gray',
    },
    {
        id: '7',
        memberId: '3',
        title: 'Landing Page D..',
        client: 'Uber Go',
        startDay: 25,
        duration: 3,
        progress: 100,
        color: 'gray',
    },
];

const DAYS = [23, 24, 25, 26, 27, 28, 29, 30, 31, 1, 2, 3];
const CURRENT_DAY = 2;
const COL_WIDTH = 63;
const MEMBER_WIDTH = 345;

/**
 * Calendar/Gantt View component
 * Displays a timeline of tasks assigned to team members
 */
export function CalendarView() {
    const getTaskStyle = (task: Task) => {
        const startIndex = DAYS.indexOf(task.startDay);
        const left = startIndex * COL_WIDTH;
        const width = task.duration * COL_WIDTH;
        return { left: `${left}px`, width: `${width}px` };
    };

    const getCurrentDayPosition = () => {
        const index = DAYS.indexOf(CURRENT_DAY);
        return index * COL_WIDTH + COL_WIDTH / 2;
    };

    return (
        <div className="calendar-view__container">
            <div className="calendar-view">
                {/* Days Header */}
                <div className="calendar-view__days">
                    {DAYS.map((day) => (
                        <div
                            key={day}
                            className={`calendar-view__day ${day === CURRENT_DAY ? 'calendar-view__day--current' : ''}`}
                        >
                            {/* Month Label */}
                            {day === 1 && <div className="calendar-view__month">Dec</div>}
                            <span>{day}</span>
                        </div>
                    ))}
                </div>

                {/* Team Rows */}
                <div className="calendar-view__rows">
                    {/* Current Day Line */}
                    <div
                        className="calendar-view__current-line"
                        style={{ left: `${MEMBER_WIDTH + getCurrentDayPosition()}px` }}
                    />

                    {/* Grid Lines */}
                    <div className="calendar-view__grid">
                        {DAYS.map((day, i) => (
                            <div
                                key={day}
                                className="calendar-view__grid-line"
                                style={{ left: `${i * COL_WIDTH}px` }}
                            />
                        ))}
                    </div>

                    {TEAM_MEMBERS.map((member, rowIndex) => (
                        <div key={member.id} className="calendar-view__row">
                            {/* Member Info */}
                            <div className="calendar-view__member">
                                <div className="calendar-view__avatar">
                                    <img src={member.avatarUrl} alt={member.name} />
                                </div>
                                <div className="calendar-view__member-info">
                                    <span className="calendar-view__member-name">{member.name}</span>
                                    <span className="calendar-view__member-role">{member.role}</span>
                                </div>
                            </div>

                            {/* Tasks */}
                            <div className="calendar-view__tasks">
                                {TASKS.filter((t) => t.memberId === member.id).map((task, taskIndex) => (
                                    <div
                                        key={task.id}
                                        className={`calendar-view__task calendar-view__task--${task.color}`}
                                        style={{
                                            ...getTaskStyle(task),
                                            top: `${taskIndex * 58}px`,
                                        }}
                                    >
                                        <div
                                            className="calendar-view__task-progress"
                                            style={{ width: `${task.progress}%` }}
                                        />
                                        <div className="calendar-view__task-content">
                                            <span className="calendar-view__task-title">{task.title}</span>
                                            <span className="calendar-view__task-client">{task.client}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Horizontal Divider */}
                            {rowIndex < TEAM_MEMBERS.length - 1 && <div className="calendar-view__divider" />}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default CalendarView;
