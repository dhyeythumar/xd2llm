import { FeaturedProducts } from './components/FeaturedProducts';
import { PostsGrid } from './components/PostsGrid';
import { ContactForm } from './components/ContactForm';
import { CalendarView } from './components/CalendarView';
import { DateRangePicker } from './components/DateRangePicker';
import './App.css';

function App() {
    return (
        <main>
            <FeaturedProducts />
            <PostsGrid />
            <ContactForm />
            <CalendarView />
            <DateRangePicker
                initialStartDate={new Date(2019, 4, 21)}
                initialEndDate={new Date(2019, 5, 10)}
                onCancel={() => console.log('Cancelled')}
                onDone={(start, end) => console.log('Selected:', start, end)}
            />
        </main>
    );
}

export default App;
