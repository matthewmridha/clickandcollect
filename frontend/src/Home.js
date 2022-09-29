import React, { Fragment, useEffect, useContext, useState } from 'react';
import { api } from './Api';
import CreateInvoice from './CreateInvoice';

import { Container, Paper, Typography, Box} from '@mui/material';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Grid from '@mui/material/Grid';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import FormHelperText from '@mui/material/FormHelperText';
import Stack from '@mui/material/Stack';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import Slide from '@mui/material/Slide';
import Collapse from '@mui/material/Collapse';
import Fade from '@mui/material/Fade';
import Switch from '@mui/material/Switch';
import Grow from '@mui/material/Grow';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker';

import { ThemeContext, FunctionContext, StateContext } from './App';

export default function Home(){

	const { DateTime, toISO } = require("luxon");

	const state = useContext( StateContext );
	const theme = useContext( ThemeContext );
    const functionContext = useContext( FunctionContext );

    const [ invoiceList, setInvoiceList ] = useState( null );
	const [ page, setPage ] = useState( 1 );
    const [ invoiceCount, setInvoiceCount ] = useState( 0 );
    const [ paymentMethodFilter, setPaymentMethodFilter ] = useState( '' );
    const [ collectionPointFilter, setCollectionPointFilter ] = useState( '' );
    const [ orderStatusFilter, setOrderStatusFilter ] = useState( '' );
    const [ page_size, setPageSize ] = useState( 10 );
    const [ searchWord, setSearchWord ] = useState( '' );
    const [ orderBy, setOrderBy ] = useState( '' );
    const [ createdAfterFilter, setCreatedAfterFilter ] = useState( null ); //greater than or equal
    const [ createdBeforeFilter, setCreatedBeforeFilter ] = useState( null ); //less than or equal
    const [ updatedAfterFilter, setUpdatedAfterFilter ] = useState( null ); //greater than or equal
    const [ updatedBeforeFilter, setUpdatedBeforeFilter ] = useState( null ); //less than or equal
	const [ cashSettledFilter, setCashSettledFilter ] = useState( false ); //boolean or blank
	const [ commissionSettledFilter, setCommissionSettledFilter ] = useState( false ); //boolean or blank
	const [ showSearchBar, setShowSeacrhBar ] = useState( false );
	const [ showFilters, setShowFilters ] = useState( false );
	const [ showInvoiceForm, setShowInvoiceForm ] = useState( false );
	
    // datetime format = yyyy-mm-ddThh:mm:ss

    const pageSizeOptions = [10, 25, 50, 'all'];
    const paymentMethodOptions = ['', 'PENDING+PAYMENT', 'PREPAID'];
    const orderStatusOptions = ['', 'PROCESSING', 'READY_FOR_DELIVERY', 'DELIVERED', 'CANCELED'];
    const orderingOptions = ['order_number'];
    
    function getInvoices(){
        let url = `/api/invoices/?
		payment_method=${ paymentMethodFilter }
		&collection_point=${ collectionPointFilter }
		&status=${ orderStatusFilter }
		&page_size=${ page_size }
		&search=${ searchWord }
		&ordering=${ orderBy }
		&created__gte=${ createdAfterFilter === null ? '' : createdAfterFilter }
		&created__lte=${ createdBeforeFilter === null ? '' : createdBeforeFilter }
		&updated__gte=${ updatedAfterFilter === null ? '' : updatedAfterFilter }
		&updated__lte=${ updatedBeforeFilter === null ? '' : updatedBeforeFilter}
		&cash_settled=${ cashSettledFilter === true ? true : '' }
		&commission_settled=${ commissionSettledFilter === true ? true : '' } 
		&p=${ page }`;
		api.get(url).then(
			( response ) => {
				let data = response.data;
				setInvoiceList( data.results )
				setInvoiceCount( data.count )
			});
    };
	   
    ///useEffect( () => {
	//	getInvoices()
	//}, [ page, searchWord, paymentMethodFilter, orderStatusFilter ]);

    const columns = [
        { id: 'order_number', label: 'Order Number', minWidth: 170 },
        { id: 'status', label: 'Status' },
        { id: 'collection_point', label: 'Collection Point' },
		{ id: 'commission_settled', label: 'Commission Settled', format: value => value === true ? <CheckCircleOutlineOutlinedIcon /> : null},
		{ id: 'cash_settled', label: 'Cash Settled', format: value => value === true ? <CheckCircleOutlineOutlinedIcon /> : null}
    ];

    const handleRowChange = ( event ) => {
		setPageSize( event.target.value );
		if ( page != 1 ){
			setPage( 1 );
		} else {
			getInvoices();
		}
	};

	const searchForWord = ( event ) => {
		setSearchWord( event.target.value );
	};

	const clearSearch = ( event ) => {
		setSearchWord( '' )
	};

	const handleBackButtonClick = ( event ) => {
		setPage(page - 1);
	};
	
	const handleNextButtonClick = ( event ) => {
		setPage(page + 1);
	};

	const toggleSearch = ( event ) => {
		setShowSeacrhBar( !showSearchBar );
	};

	const toggleFilters = ( event ) => {
		setShowFilters ( !showFilters )
	};

	const handlePaymentMethodFilter = ( event ) => {
		setPaymentMethodFilter( event.target.value )
	};

	const handleOrderStatusFilter = ( event ) => {
		setOrderStatusFilter( event.target.value )
	};

	const changeCashSettledFilter = ( event ) => {
		setCashSettledFilter( !cashSettledFilter )
	};

	const changeCommissionSettledFilter = ( event ) => {
		setCommissionSettledFilter( !commissionSettledFilter )
	}

	const formatDate = ( value ) => {
		let dt = DateTime.fromObject( value )
		.set({ hour : 0, minute : 0, second : 0 })
		.toISO({includeOffset: false, ssuppressMilliseconds: true})
		return dt
	};

	const handleOrderFromTimeChange = ( newValue ) => {
		let dt = formatDate( newValue.c )
		setCreatedAfterFilter(dt);
	};

	const handleOrderToTimeChange = ( newValue ) => {
		let dt = formatDate( newValue.c )
		setCreatedBeforeFilter(dt);
	};

	const handleUpdatedFromTimeChange = ( newValue ) => {
		let dt = formatDate( newValue.c )
		setUpdatedAfterFilter(dt);
	};

	const handleUpdatedToTimeChange = ( newValue ) => {
		let dt = formatDate( newValue.c )
		setUpdatedBeforeFilter(dt);
	};
	

	const InvoiceForm = (
		<Box >
			<CreateInvoice />
		</Box>
		
	  );
	
	

	const showForm = event => { setShowInvoiceForm(!showInvoiceForm) }
	return(
        <Fragment>
            <Container>
                <Paper>
					<Grid container direction="row" style={{ padding: theme.defaults.padding }}>
						<Grid item xs={ 3 } style={{ display:'flex', justifyContent: 'start' }}>
							{ state.data.user && state.data.user.is_staff ? 
								<div>
									<IconButton onClick={ showForm }>
										<AddCircleOutlineIcon />
									</IconButton>
									<Box >
										<Grow in={showInvoiceForm} sx={showInvoiceForm ? {display:'flex'} : {display: 'none'}}>
											{InvoiceForm}
										</Grow>
									</Box>
								</div> 
							: null }
						</Grid>
						<Grid item xs={ 6 } style={{ display:'flex', justifyContent: 'center' }}>
							<Typography variant='h4' style={{ color:theme.colors.primary }}>Packages</Typography>
						</Grid>
						<Grid item xs={ 3 } style={{ display:'flex', justifyContent: 'end' }}>
							<Grid container justifyContent="end">
								<IconButton onClick={ toggleSearch } >
									<SearchOutlinedIcon />
								</IconButton>
								<IconButton onClick={ toggleFilters }>
									<FilterAltOutlinedIcon />
								</IconButton>
							</Grid>
						</Grid>
					</Grid>
					
					<Stack style={{ padding: theme.defaults.padding }} >
						<Collapse direction='down' in={ showSearchBar }>
							<FormControl fullWidth>
								<TextField
									label="Search"
									id="outlined-start-adornment"
									size="small"
									onChange={ searchForWord }
									value={ searchWord }
									InputProps={{
										endAdornment: <InputAdornment position="end">
											<IconButton onClick={ clearSearch }>
												<CancelOutlinedIcon />
											</IconButton>
											</InputAdornment>,
										}}
								/>
							</FormControl>
						</Collapse>
					</Stack>
					<Collapse direction='down' in={ showFilters} >
						<Stack spacing={ 0.5 } direction='column' style={{ padding: theme.defaults.padding }} >
							<Stack direction='row' spacing={ 0.5 }>
								<FormControl fullWidth>
									<InputLabel id="payment-method-filter-input">Payment Method</InputLabel>
									<Select
										labelId="payment-method-filter-label"
										id="payment-method-filter"
										label="Payment Method"
										onChange={ handlePaymentMethodFilter }
									>
										{ paymentMethodOptions.map( option => {
											return (
												<MenuItem key={option} value={option}>
													{ option === '' ? 'ALL' : option.replaceAll('+', ' ') }
												</MenuItem>
											)
										})}
									</Select>
								</FormControl>
								<FormControl  fullWidth>
									<InputLabel id="order-status-filter-input">Order Status</InputLabel>
									<Select
										labelId="order-status-filter-label"
										id="order-status-filter"
										label="Order Status"
										onChange={ handleOrderStatusFilter }
									>
										{ orderStatusOptions.map( option => {
											return (
												<MenuItem key={ option } value={ option }>
													{ option === '' ? 'ALL' : option.replaceAll('_', ' ') }
												</MenuItem>
											)
										})}
									</Select>
								</FormControl>
							</Stack>
							<Typography>Order Date</Typography>
							<Stack direction='row' spacing={ 0.5 }>
								<LocalizationProvider dateAdapter={ AdapterLuxon }>
									<DesktopDatePicker
										label="Date From"
										value={ createdAfterFilter }
										onChange={ handleOrderFromTimeChange }
										renderInput={ ( params ) => <TextField { ...params } />}
									/>
								</LocalizationProvider>
								<LocalizationProvider dateAdapter={ AdapterLuxon }>
									<DesktopDatePicker
										label="Date To"
										value={ createdBeforeFilter }
										onChange={ handleOrderToTimeChange }
										renderInput={ ( params ) => <TextField { ...params } />}
									/>
								</LocalizationProvider>
							</Stack>
							<Typography>Last Updated</Typography>
							<Stack direction='row' spacing={ 0.5 }>
								<LocalizationProvider dateAdapter={ AdapterLuxon }>
									<DesktopDatePicker
										label="Date From"
										value={ updatedAfterFilter }
										onChange={ handleUpdatedFromTimeChange }
										renderInput={ ( params ) => <TextField { ...params } />}
									/>
								</LocalizationProvider>
								<LocalizationProvider dateAdapter={ AdapterLuxon }>
									<DesktopDatePicker
										label="Date To"
										value={ updatedBeforeFilter }
										onChange={ handleUpdatedToTimeChange }
										renderInput={ ( params ) => <TextField { ...params } />}
									/>
								</LocalizationProvider>
							</Stack>
							<Grid container spacing={ 0.5 }>
								<Grid item>
									<FormGroup>
										<FormControlLabel control={<Checkbox
											checked={cashSettledFilter}
											onChange={ changeCashSettledFilter }
											inputProps={{ 'aria-label': 'cash filter' }}
											/>} 
											label="Cash Settled" />
									</FormGroup>
								</Grid>
								<Grid item>
									<FormGroup>
										<FormControlLabel control={<Checkbox
											checked={ commissionSettledFilter }
											onChange={ changeCommissionSettledFilter }
											inputProps={{ 'aria-label': 'commission filter' }}
											/>} 
											label="Commission Paid" />
									</FormGroup>
								</Grid>
							</Grid>
							<Button variant="contained" fullWidth onClick={ getInvoices }>Generate</Button>
						</Stack>
					</Collapse>
					<TableContainer sx={{ maxHeight: 440 }}>
						<Table stickyHeader aria-label="sticky table">
							<TableHead>
								<TableRow>
									{ columns.map(( column ) => (
										<TableCell
											key={ column.id }
											align={ column.align }
											style={{ minWidth: column.minWidth }}
											>
											{ column.label }
										</TableCell>
									))}
								</TableRow>
							</TableHead>
							<TableBody>
								{ invoiceList && invoiceList
								.map(( invoice ) => {
									return (
										<TableRow hover role="checkbox" tabIndex={ -1 } key={ invoice.order_number }>
											{ columns.map(( column ) => {
											const value = invoice[ column.id ];
											return (
												<TableCell key={ column.id } align={ column.align }>
												{ column.format 
													? column.format( value )
													: value 
												}
												</TableCell>
											);
											})}
										</TableRow>
									);
								})}
							</TableBody>
						</Table>
					</TableContainer>
					<Grid container justifyContent="end" style={{ padding:'5px 20px 5px 0px' }}>
						<Grid item >
							<IconButton
								onClick={ handleBackButtonClick }
								disabled={ page === 1 }
								aria-label="previous page"
							>
								<KeyboardArrowLeft />
							</IconButton>
							<IconButton>
								<Typography>
									{ `${ page } of ${ Math.ceil( invoiceCount / page_size ) }` }
								</Typography>
							</IconButton>
							<IconButton
								onClick={ handleNextButtonClick }
								disabled={ page >= Math.ceil( invoiceCount / page_size )}
								aria-label="next page"
							>
								<KeyboardArrowRight />
							</IconButton>
						</Grid>
						<Grid item >
							<FormControl>
								<InputLabel id="rows-per-page">Rows Per Page</InputLabel>
								<Select
									labelId="rows-per-page"
									id="rows-per-page"
									value={ page_size }
									label="Rows per page"
									size="small"
									onChange={ handleRowChange }
								>
									{ pageSizeOptions.map( option => {
										return (
											<MenuItem 
												key={ option } 
												value={ option === 'all' ? parseInt( invoiceCount ) : option } >
												{ option.toString() }
											</MenuItem>
										)
									})}
								</Select>
							</FormControl>
						</Grid>
					</Grid>
				</Paper>
			</Container>
        </Fragment>
    )
};