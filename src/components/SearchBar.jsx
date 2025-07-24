import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {FiSearch} from 'react-icons/fi';
import '../style/components/SearchBar.css';

function SearchBar() {
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/profile/search/${searchQuery.trim()}`);
            setSearchQuery('');
        }
    };

    return (<form className="search-form" onSubmit={handleSearch}>
        <div className="search-container">
            <input
                type="text"
                placeholder="Tìm kiếm người chơi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
            />
            <button type="submit" className="search-button">
                <FiSearch size={18} className="search-icon"/>
            </button>
        </div>
    </form>);
}

export default SearchBar;
