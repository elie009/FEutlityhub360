import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Divider,
  Grid,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
} from '@mui/material';
import {
  MenuBook as MenuBookIcon,
  Dashboard as DashboardIcon,
  Receipt as BillsIcon,
  AccountBalanceWallet as TransactionsIcon,
  AccountBalance as BankIcon,
  Savings as SavingsIcon,
  CreditCard as LoansIcon,
  TrendingUp as ApportionerIcon,
  Assessment as AnalyticsIcon,
  Help as HelpIcon,
  Search as SearchIcon,
} from '@mui/icons-material';

interface DocumentationFile {
  title: string;
  filename: string;
  category: 'getting-started' | 'managing-money' | 'features' | 'tools';
  description: string;
  icon: React.ReactNode;
}

const documentationFiles: DocumentationFile[] = [
  {
    title: 'Getting Started',
    filename: 'USER_GUIDE_GETTING_STARTED.md',
    category: 'getting-started',
    description: 'Welcome guide and first steps to using UtilityHub360',
    icon: <MenuBookIcon />,
  },
  {
    title: 'Dashboard Guide',
    filename: 'USER_GUIDE_DASHBOARD.md',
    category: 'getting-started',
    description: 'Understanding your financial dashboard and overview',
    icon: <DashboardIcon />,
  },
  {
    title: 'Managing Bills',
    filename: 'USER_GUIDE_BILLS.md',
    category: 'managing-money',
    description: 'How to add, track, and pay your bills and utilities',
    icon: <BillsIcon />,
  },
  {
    title: 'Transactions',
    filename: 'USER_GUIDE_TRANSACTIONS.md',
    category: 'managing-money',
    description: 'Track and manage all your income and expenses',
    icon: <TransactionsIcon />,
  },
  {
    title: 'Bank Accounts',
    filename: 'USER_GUIDE_BANK_ACCOUNTS.md',
    category: 'managing-money',
    description: 'Add and manage your bank accounts and credit cards',
    icon: <BankIcon />,
  },
  {
    title: 'Savings Goals',
    filename: 'USER_GUIDE_SAVINGS.md',
    category: 'features',
    description: 'Set savings goals and track your progress',
    icon: <SavingsIcon />,
  },
  {
    title: 'Loans Management',
    filename: 'USER_GUIDE_LOANS.md',
    category: 'features',
    description: 'Track loans, payments, and repayment schedules',
    icon: <LoansIcon />,
  },
  {
    title: 'Apportioner Tool',
    filename: 'USER_GUIDE_APPORTIONER.md',
    category: 'tools',
    description: 'Smart budget allocation and income distribution',
    icon: <ApportionerIcon />,
  },
  {
    title: 'Analytics & Reports',
    filename: 'USER_GUIDE_ANALYTICS.md',
    category: 'tools',
    description: 'Financial insights, trends, and detailed reports',
    icon: <AnalyticsIcon />,
  },
];

const Documentation: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const [selectedDoc, setSelectedDoc] = useState<DocumentationFile | null>(null);
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<'all' | 'getting-started' | 'managing-money' | 'features' | 'tools'>('all');

  useEffect(() => {
    if (selectedDoc) {
      loadDocumentation(selectedDoc.filename);
    }
  }, [selectedDoc]);

  // Filter documentation files based on search query
  const filterDocsBySearch = (docs: DocumentationFile[], query: string): DocumentationFile[] => {
    if (!query.trim()) return docs;
    
    const lowerQuery = query.toLowerCase();
    return docs.filter(doc => 
      doc.title.toLowerCase().includes(lowerQuery) ||
      doc.description.toLowerCase().includes(lowerQuery) ||
      doc.category.toLowerCase().includes(lowerQuery) ||
      doc.filename.toLowerCase().includes(lowerQuery)
    );
  };

  const loadDocumentation = async (filename: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/docs/${filename}`);
      if (!response.ok) {
        throw new Error(`Failed to load ${filename}`);
      }
      const text = await response.text();
      
      // Simple markdown to HTML converter for basic formatting
      let html = text
        // Headers
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        // Bold
        .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
        // Italic
        .replace(/\*(.*?)\*/gim, '<em>$1</em>')
        // Lists
        .replace(/^\* (.*$)/gim, '<li>$1</li>')
        .replace(/^- (.*$)/gim, '<li>$1</li>')
        // Wrap consecutive list items
        .replace(/(<li>.*<\/li>\n?)+/gim, '<ul>$&</ul>')
        // Line breaks
        .replace(/\n\n/gim, '</p><p>')
        .replace(/\n/gim, '<br>');
      
      // Wrap in paragraph tags
      if (!html.startsWith('<')) {
        html = '<p>' + html + '</p>';
      }
      
      setContent(html);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load documentation');
      setContent('');
    } finally {
      setLoading(false);
    }
  };

  const handleDocSelect = (doc: DocumentationFile) => {
    setSelectedDoc(doc);
  };

  // First filter by category
  const categoryFilteredDocs = category === 'all' 
    ? documentationFiles 
    : documentationFiles.filter(doc => doc.category === category);

  // Then filter by search query if present
  const filteredDocs = searchQuery 
    ? filterDocsBySearch(categoryFilteredDocs, searchQuery)
    : categoryFilteredDocs;

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            User Guide & Documentation
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {searchQuery 
              ? `Search results for "${searchQuery}" - ${filteredDocs.length} guide${filteredDocs.length !== 1 ? 's' : ''} found`
              : 'Learn how to use UtilityHub360 to manage your finances effectively. Browse guides by category or search for specific topics.'}
          </Typography>
        </Box>
        {searchQuery && (
          <Chip
            label={`Clear search: "${searchQuery}"`}
            onDelete={() => {
              setSearchParams({});
              setCategory('all');
            }}
            color="primary"
            variant="outlined"
            sx={{ ml: 2 }}
          />
        )}
      </Box>

      <Grid container spacing={3}>
        {/* Documentation List */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: 'calc(100vh - 200px)', overflow: 'auto' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="h6">
                User Guides
              </Typography>
              {searchQuery && (
                <Chip
                  label={`${filteredDocs.length} result${filteredDocs.length !== 1 ? 's' : ''}`}
                  size="small"
                  color="primary"
                />
              )}
            </Box>
            
            <Tabs 
              value={category} 
              onChange={(_, newValue) => setCategory(newValue)}
              sx={{ mb: 2 }}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="All" value="all" />
              <Tab label="Getting Started" value="getting-started" />
              <Tab label="Managing Money" value="managing-money" />
              <Tab label="Features" value="features" />
              <Tab label="Tools" value="tools" />
            </Tabs>

            <Divider sx={{ mb: 2 }} />

            <List>
              {filteredDocs.map((doc, index) => (
                <React.Fragment key={doc.filename}>
                  <ListItem disablePadding>
                    <ListItemButton
                      selected={selectedDoc?.filename === doc.filename}
                      onClick={() => handleDocSelect(doc)}
                      sx={{
                        borderRadius: 1,
                        mb: 0.5,
                        '&.Mui-selected': {
                          backgroundColor: 'primary.main',
                          color: 'white',
                          '&:hover': {
                            backgroundColor: 'primary.dark',
                          },
                          '& .MuiListItemIcon-root': {
                            color: 'white',
                          },
                        },
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          color: selectedDoc?.filename === doc.filename ? 'white' : 'inherit',
                        }}
                      >
                        {doc.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={doc.title}
                        secondary={doc.description}
                        secondaryTypographyProps={{
                          sx: {
                            color: selectedDoc?.filename === doc.filename ? 'rgba(255,255,255,0.7)' : 'inherit',
                          },
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                  {index < filteredDocs.length - 1 && <Divider component="li" />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Documentation Content */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: 'calc(100vh - 200px)', overflow: 'auto' }}>
            {!selectedDoc ? (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  textAlign: 'center',
                  color: 'text.secondary',
                }}
              >
                {searchQuery && filteredDocs.length > 0 ? (
                  <>
                    <SearchIcon sx={{ fontSize: 60, mb: 2, opacity: 0.5, color: 'primary.main' }} />
                    <Typography variant="h6" gutterBottom>
                      Search Results for "{searchQuery}"
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}>
                      Found {filteredDocs.length} guide{filteredDocs.length !== 1 ? 's' : ''} matching your search
                    </Typography>
                    <Box sx={{ width: '100%', maxWidth: 600 }}>
                      <List>
                        {filteredDocs.map((doc, index) => (
                          <React.Fragment key={doc.filename}>
                            <ListItem disablePadding>
                              <ListItemButton
                                onClick={() => handleDocSelect(doc)}
                                sx={{
                                  borderRadius: 1,
                                  mb: 1,
                                  border: '1px solid',
                                  borderColor: 'divider',
                                  '&:hover': {
                                    backgroundColor: 'action.hover',
                                    borderColor: 'primary.main',
                                  },
                                }}
                              >
                                <ListItemIcon>
                                  {doc.icon}
                                </ListItemIcon>
                                <ListItemText
                                  primary={doc.title}
                                  secondary={doc.description}
                                />
                                <Chip
                                  label={doc.category.replace('-', ' ')}
                                  size="small"
                                  sx={{ ml: 1 }}
                                />
                              </ListItemButton>
                            </ListItem>
                            {index < filteredDocs.length - 1 && <Divider sx={{ my: 1 }} />}
                          </React.Fragment>
                        ))}
                      </List>
                    </Box>
                  </>
                ) : searchQuery && filteredDocs.length === 0 ? (
                  <>
                    <SearchIcon sx={{ fontSize: 60, mb: 2, opacity: 0.3 }} />
                    <Typography variant="h6" gutterBottom>
                      No results found for "{searchQuery}"
                    </Typography>
                    <Typography variant="body2" sx={{ maxWidth: 400, mx: 'auto', mb: 2 }}>
                      Try searching with different keywords or browse all guides from the list.
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        cursor: 'pointer', 
                        color: 'primary.main',
                        textDecoration: 'underline',
                      }}
                      onClick={() => {
                        setSearchParams({});
                        setCategory('all');
                      }}
                    >
                      Clear search and show all guides
                    </Typography>
                  </>
                ) : (
                  <>
                    <HelpIcon sx={{ fontSize: 80, mb: 2, opacity: 0.3 }} />
                    <Typography variant="h6" gutterBottom>
                      Select a guide to get started
                    </Typography>
                    <Typography variant="body2" sx={{ maxWidth: 400, mx: 'auto' }}>
                      Choose a user guide from the list to learn how to use different features of UtilityHub360. Start with "Getting Started" if you're new!
                    </Typography>
                  </>
                )}
              </Box>
            ) : (
              <Box>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h5" gutterBottom>
                    {selectedDoc.title}
                  </Typography>
                  <Chip
                    label={selectedDoc.category}
                    size="small"
                    color="primary"
                    sx={{ mb: 2 }}
                  />
                  <Divider sx={{ mt: 2 }} />
                </Box>

                {loading ? (
                  <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                    <CircularProgress />
                  </Box>
                ) : error ? (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                ) : (
                  <Box
                    sx={{
                      '& h1, & h2, & h3, & h4, & h5, & h6': {
                        mt: 3,
                        mb: 2,
                        fontWeight: 600,
                      },
                      '& h1': { fontSize: '2rem', borderBottom: '2px solid', borderColor: 'divider', pb: 1 },
                      '& h2': { fontSize: '1.75rem', borderBottom: '1px solid', borderColor: 'divider', pb: 0.5 },
                      '& h3': { fontSize: '1.5rem' },
                      '& h4': { fontSize: '1.25rem' },
                      '& p': { mb: 2, lineHeight: 1.8 },
                      '& ul, & ol': { mb: 2, pl: 3 },
                      '& li': { mb: 1 },
                      '& code': {
                        backgroundColor: 'rgba(0, 0, 0, 0.05)',
                        padding: '2px 6px',
                        borderRadius: 1,
                        fontSize: '0.9em',
                        fontFamily: 'monospace',
                      },
                      '& pre': {
                        backgroundColor: 'rgba(0, 0, 0, 0.05)',
                        padding: 2,
                        borderRadius: 1,
                        overflow: 'auto',
                        mb: 2,
                      },
                      '& pre code': {
                        backgroundColor: 'transparent',
                        padding: 0,
                      },
                      '& table': {
                        width: '100%',
                        borderCollapse: 'collapse',
                        mb: 2,
                      },
                      '& th, & td': {
                        border: '1px solid',
                        borderColor: 'divider',
                        padding: 1,
                        textAlign: 'left',
                      },
                      '& th': {
                        backgroundColor: 'rgba(0, 0, 0, 0.05)',
                        fontWeight: 600,
                      },
                      '& blockquote': {
                        borderLeft: '4px solid',
                        borderColor: 'primary.main',
                        pl: 2,
                        ml: 0,
                        fontStyle: 'italic',
                        mb: 2,
                      },
                    }}
                  >
                    <Box
                      component="div"
                      dangerouslySetInnerHTML={{ __html: content }}
                      sx={{
                        '& h1': { fontSize: '2rem', fontWeight: 600, mt: 3, mb: 2, pb: 1, borderBottom: '2px solid', borderColor: 'divider' },
                        '& h2': { fontSize: '1.75rem', fontWeight: 600, mt: 3, mb: 2, pb: 0.5, borderBottom: '1px solid', borderColor: 'divider' },
                        '& h3': { fontSize: '1.5rem', fontWeight: 600, mt: 2, mb: 1.5 },
                        '& h4': { fontSize: '1.25rem', fontWeight: 600, mt: 2, mb: 1 },
                        '& p': { mb: 2, lineHeight: 1.8 },
                        '& ul, & ol': { mb: 2, pl: 3 },
                        '& li': { mb: 1 },
                        '& strong': { fontWeight: 600 },
                        '& em': { fontStyle: 'italic' },
                      }}
                    />
                  </Box>
                )}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Documentation;

