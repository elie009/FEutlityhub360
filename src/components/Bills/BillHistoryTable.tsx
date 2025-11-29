import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Visibility,
  TrendingUp,
  TrendingDown,
  Remove,
} from '@mui/icons-material';
import { Bill, BillStatus, MonthlyBillData } from '../../types/bill';

interface BillHistoryTableProps {
  bills: Bill[] | MonthlyBillData[];
  onViewDetails?: (bill: Bill | MonthlyBillData) => void;
  showVariance?: boolean;
  estimatedAmounts?: Map<string, number>;
}

type SortOrder = 'asc' | 'desc';
type SortField = 'date' | 'amount' | 'variance';

const BillHistoryTable: React.FC<BillHistoryTableProps> = ({
  bills,
  onViewDetails,
  showVariance = false,
  estimatedAmounts,
}) => {
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: BillStatus) => {
    switch (status) {
      case 'PAID':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'OVERDUE':
        return 'error';
      default:
        return 'default';
    }
  };

  const calculateVariance = (actual: number, estimated?: number) => {
    if (!estimated) return null;
    const variance = actual - estimated;
    const variancePercentage = (variance / estimated) * 100;
    return { variance, variancePercentage };
  };

  const getVarianceIcon = (variancePercentage: number) => {
    if (Math.abs(variancePercentage) < 1) return <Remove fontSize="small" />;
    return variancePercentage > 0 ? (
      <TrendingUp fontSize="small" />
    ) : (
      <TrendingDown fontSize="small" />
    );
  };

  const getVarianceColor = (variancePercentage: number) => {
    if (Math.abs(variancePercentage) < 1) return 'text.secondary';
    return variancePercentage > 0 ? 'error.main' : 'success.main';
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedBills = [...bills].sort((a, b) => {
    const aDate = 'dueDate' in a ? new Date(a.dueDate).getTime() : 0;
    const bDate = 'dueDate' in b ? new Date(b.dueDate).getTime() : 0;
    const aAmount = a.amount;
    const bAmount = b.amount;

    let comparison = 0;
    switch (sortField) {
      case 'date':
        comparison = aDate - bDate;
        break;
      case 'amount':
        comparison = aAmount - bAmount;
        break;
      case 'variance':
        if (showVariance && estimatedAmounts) {
          const aId = 'id' in a ? a.id : '';
          const bId = 'id' in b ? b.id : '';
          const aEst = estimatedAmounts.get(aId) || 0;
          const bEst = estimatedAmounts.get(bId) || 0;
          const aVar = aEst ? ((aAmount - aEst) / aEst) * 100 : 0;
          const bVar = bEst ? ((bAmount - bEst) / bEst) * 100 : 0;
          comparison = aVar - bVar;
        }
        break;
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  if (bills.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          No bill history available
        </Typography>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>
              <TableSortLabel
                active={sortField === 'date'}
                direction={sortField === 'date' ? sortOrder : 'asc'}
                onClick={() => handleSort('date')}
              >
                Month
              </TableSortLabel>
            </TableCell>
            <TableCell align="right">
              <TableSortLabel
                active={sortField === 'amount'}
                direction={sortField === 'amount' ? sortOrder : 'asc'}
                onClick={() => handleSort('amount')}
              >
                Amount
              </TableSortLabel>
            </TableCell>
            {showVariance && (
              <>
                <TableCell align="right">Estimated</TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={sortField === 'variance'}
                    direction={sortField === 'variance' ? sortOrder : 'asc'}
                    onClick={() => handleSort('variance')}
                  >
                    Variance
                  </TableSortLabel>
                </TableCell>
              </>
            )}
            <TableCell>Status</TableCell>
            <TableCell>Paid Date</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedBills.map((bill, index) => {
            const billId = 'id' in bill ? bill.id : index.toString();
            const estimated = showVariance && estimatedAmounts ? estimatedAmounts.get(billId) : undefined;
            const varianceData = estimated ? calculateVariance(bill.amount, estimated) : null;
            const dueDate = 'dueDate' in bill ? bill.dueDate : '';
            const paidDate = 'paidDate' in bill ? bill.paidDate : undefined;

            return (
              <TableRow key={billId} hover>
                <TableCell>
                  <Typography variant="body2">
                    {formatDate(dueDate)}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" fontWeight="medium">
                    {formatCurrency(bill.amount)}
                  </Typography>
                </TableCell>
                {showVariance && (
                  <>
                    <TableCell align="right">
                      <Typography variant="body2" color="text.secondary">
                        {estimated ? formatCurrency(estimated) : '—'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      {varianceData ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                          <Box sx={{ color: getVarianceColor(varianceData.variancePercentage) }}>
                            {getVarianceIcon(varianceData.variancePercentage)}
                          </Box>
                          <Typography
                            variant="body2"
                            fontWeight="bold"
                            color={getVarianceColor(varianceData.variancePercentage)}
                          >
                            {varianceData.variancePercentage >= 0 ? '+' : ''}
                            {varianceData.variancePercentage.toFixed(1)}%
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">—</Typography>
                      )}
                    </TableCell>
                  </>
                )}
                <TableCell>
                  <Chip
                    label={bill.status}
                    color={getStatusColor(bill.status) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {paidDate ? formatDate(paidDate) : '—'}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  {onViewDetails && (
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => onViewDetails(bill)}
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default BillHistoryTable;

