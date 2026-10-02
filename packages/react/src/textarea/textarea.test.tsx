import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { Textarea } from './textarea';

describe('Textarea', () => {
  it('supports multiline editing, native maxLength and the DOM ref', async () => {
    const ref = createRef<HTMLTextAreaElement>();
    render(<Textarea ref={ref} aria-label="简介" maxLength={9} name="description" rows={4} />);
    const textarea = screen.getByRole('textbox');
    await userEvent.type(textarea, 'Leaf{Enter}Garden');
    expect(textarea).toHaveValue('Leaf\nGard');
    expect(textarea).toHaveAttribute('rows', '4');
    expect(ref.current).toBe(textarea);
  });
  it('passes accessibility attributes and prevents disabled editing', async () => {
    render(
      <Textarea
        aria-label="简介"
        status="error"
        aria-describedby="error"
        disabled
        defaultValue="Locked"
      />,
    );
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveAttribute('aria-invalid', 'true');
    expect(textarea).toHaveAttribute('aria-describedby', 'error');
    await userEvent.type(textarea, 'edit');
    expect(textarea).toHaveValue('Locked');
  });
});
