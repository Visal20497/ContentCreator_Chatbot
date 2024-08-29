import ReactMarkdown from 'markdown-to-jsx';
import { Typography, Link, Box } from '@mui/material';

const options = {
    overrides: {
        body: {
            component: Typography,
            props: {
                variant: 'body1',
            },
        },
        h5: {
            component: Typography,
            props: {
                margin: '2px',
                fontWeight: '700',
                fontSize: '14px',
            },
        },

        p: {
            component: Typography,
            props: { paragraph: true, variant: 'body2', marginBottom: '6px' },
        },
        a: {
            component: Link,
            props: {
                rel: 'noreferrer',
                target: '_blank',
            },
        },
        ul: {
            props: {
                marginTop: '3px',
                marginBottom: '3px',
            },
        },
        li: {
            component: (props) => {
                return (
                    <>
                        <Box
                            component="li"
                            sx={{ mt: 1, typography: 'body2' }}
                            {...props}
                        />
                    </>
                );
            },
        },
    },
};

interface MarkdownProps {
    /** Content to render as HTML */
    children: string;
}

export const Markdown = (props: MarkdownProps) => {
    const { children } = props;
    return <ReactMarkdown options={options}>{children}</ReactMarkdown>;
};
