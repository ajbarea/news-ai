import { render, screen } from '@testing-library/react';
import NotFound from '../components/NotFound';

describe('NotFound component', () => {
    it('should display the not found message', () => {
        render(<NotFound />);
        expect(screen.getByText('404 - Not Found')).toBeInTheDocument();
    });
});