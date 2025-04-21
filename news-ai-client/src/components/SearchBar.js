import React from 'react';
import { Card, CardBody, InputGroup, Input, Button, Spinner } from 'reactstrap';
import { FaSearch } from 'react-icons/fa';

/**
 * Reusable search bar component
 */
const SearchBar = ({ 
  searchQuery, 
  setSearchQuery, 
  handleSearch, 
  handleKeyPress, 
  isSearching, 
  searchError
}) => {
  return (
    <Card className="border-primary shadow-sm">
      <CardBody>
        <InputGroup>
          <Input
            type="text"
            placeholder="Search for any news topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isSearching}
            className="border-end-0"
          />
          <Button
            color="primary"
            onClick={handleSearch}
            disabled={isSearching}
          >
            {isSearching ? (
              <>
                <Spinner size="sm" /> Searching...
              </>
            ) : (
              <>
                <FaSearch className="me-1" /> Search
              </>
            )}
          </Button>
        </InputGroup>
        {searchError && <div className="text-danger mt-2">{searchError}</div>}
      </CardBody>
    </Card>
  );
};

export default SearchBar;
