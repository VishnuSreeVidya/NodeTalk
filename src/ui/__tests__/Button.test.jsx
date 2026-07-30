import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Button from '../Button'

describe('Button', () => {
  it('renders children', () => {
    render(<Button variant="primary">Click me</Button>)
    expect(screen.getByRole('button')).toHaveTextContent('Click me')
  })

  it('shows spinner when loading', () => {
    render(<Button loading>Send</Button>)
    const btn = screen.getByRole('button')
    expect(btn).toBeDisabled()
    expect(btn.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('respects disabled prop', () => {
    render(<Button disabled>Send</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Click</Button>)
    await user.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
