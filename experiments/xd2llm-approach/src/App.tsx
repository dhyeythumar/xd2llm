import { FeaturedProducts } from './components/FeaturedProducts';
import { PostsGrid } from './components/PostsGrid';
import { ContactForm } from './components/ContactForm';
import './App.css';

function App() {
    return (
        <main>
            <FeaturedProducts />
            <PostsGrid />
            <ContactForm />
        </main>
    );
}

export default App;
