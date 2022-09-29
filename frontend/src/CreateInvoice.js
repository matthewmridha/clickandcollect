import React, {Fragment, useState, useEffect, useContext } from 'react';

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { api, api_call } from './Api';
import Stack from '@mui/material/Stack';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Divider from '@mui/material/Divider';
import { Tab } from '@mui/material';
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import IconButton from '@mui/material/IconButton';
/* 

            "order_number",
            "customer",
            "collection_point", 
            "status", 
            "invoiced_amount",
            "payment_method",
            "created",
            "updated",
            "boxes",
            "invoice_total",
            "invoice_commission",
            "products",
            "settlement"

*/


export default function CreateInvoice(){


    const [ vendors, setVendors ] = useState( [] );
    const [ orderNumber, setOrderNumber ] = useState( '' );
    const [ validOrderNumber, setValidOrderNumber ] = useState( true );
    const [ orderNumberHelperText, setOrderNumberHelperText ] = useState( '' );
    const [ customerPhone, setCustomerPhone ] = useState( '' );
    const [ customerEmail, setCusomerEmail ] = useState( '' );
    const [ customerName, setCustomerName ] = useState( '' );
    const [ vendor, setVendor ] = useState( '' );
    const [ barcode, setBarcode ] = useState( '' );
    const [ validBarcode, setValidBarcode ] = useState( false );
    const [ item , setItem ] = useState( null );
    const [ itemQty, setItemQty ] = useState( 1 );
    const [ itemDiscount, setItemDiscount ] = useState( 0.00 );
    const [ itemNet, setItemNet ] = useState( 0.00 );
    const [ productsInInvoice, setProductsInInvoice ] = useState( [] );
    const [ paymentMethod, setPaymentMethod ] = useState( 'COD' )

    useEffect( () => {
        getVendors();
    }, []);

    useEffect ( () => {
        validateItem();
    }, [barcode])

    useEffect( () => {
        if ( validBarcode ) {
            getItem();
        } else{
            setItem( null );
        }
    }, [ validBarcode ]);

    useEffect( () => {
        console.log( productsInInvoice )
    }, [productsInInvoice]);

    
    const getVendors = () => {
        api.get('api/get_vendors').then( 
            (response) => { 
                setVendors(response.data)
            }
        ).catch( (err) => { 
                alert(err)
        });
    };

    const getItem = () => {
        api.get(`./api/items/?search=${barcode}`).then( 
            ( response ) => { 
                setItem( response.data[0] )
            }
        ).catch( ( err ) => { 
            alert( err )
        });
    };

    const validateInvoiceNumber = () => {
        if ( orderNumber.length > 0 ){
            if ( !isNaN(orderNumber) ) {
                api.get(`./api/checkInvoiceNumber/${orderNumber}`).then( 
                    ( response ) => { 
                        if ( response.data.message === 'invalid' ) {
                            setValidOrderNumber( false)
                            setOrderNumberHelperText ( 'This order number exists' );
                        } else {
                            setValidOrderNumber( true )
                            setOrderNumberHelperText ( '' );
                        }
                    }
                )
            } else {
                setValidOrderNumber( false );
                setOrderNumberHelperText ( 'Order Number must be Numberic' );
            }
        } else {
            if ( !validOrderNumber ) {
                setValidOrderNumber( true );
                setOrderNumberHelperText ( '' );
            }
        };
    };

    const validateItem = () => {
        if ( barcode.length > 0 ){
            api.get(`./api/checkItem/${barcode}`).then( 
                ( response ) => {
                    if ( response.data.message === 'valid' ) {
                        setValidBarcode( true );
                    } else {
                        if ( validBarcode === true ){
                            setValidBarcode( false )
                        }
                    }
                }
            )
        } else {
            setValidBarcode( false );
        }
    };

    const handleOrderNumberChange = ( e ) => {
        setOrderNumber( e.target.value );
    };

    const handleCustomerPhoneChange = ( e ) => {
        setCustomerPhone( e.target.value );
    };

    const handleEmailChange = ( e ) => {
        setCusomerEmail( e.target.value );
    };

    const handleCustomerNameChange = ( e ) => {
        setCustomerName( e.target.value );
    };

    const handleVendorChange = ( e ) => {
        setVendor( e.target.value );
    };

    const handleBarcodeChange = ( e ) => {
        setBarcode( e.target.value );
    };

    const handleItemQtyChange = ( e ) => {
        setItemQty( e.target.value );
    };

    const handleItemDiscountChange = ( e ) => {
        setItemDiscount( e.target.value );
    };

    const handlePaymentMethodChange = ( e ) => {
        setPaymentMethod( e.target.value );
    };

    const getCustomer = ( e ) => {
        if (e.keyCode === 13 ){ 
            let url = `api/get_customer/?search=${customerEmail}`;
            api.get(url).then( 
                ( response ) => {
                    if ( response.ok ){}
                    let result = response.data.results
                    if ( result.length > 0 ){
                        setCustomerPhone(result[0]['phone']);
                        setCustomerName(result[0]['name']);
                        let order = document.getElementById('order');
                        order.focus();
                    } else {
                        let phone = document.getElementById('phone');
                        phone.focus();
                    }
                }
            ).catch( ( err ) => {
                alert( err );
            });
        }
    };

    const checkIfItemInInvoice = ( id ) => {
        return productsInInvoice.some( ( product ) => {
            return product.item.id === id
        })
    };

    const addProductToInvoice = () => {
        if ( item ){
            if( checkIfItemInInvoice( item.id )) {
                let target = productsInInvoice.find( ( product ) => product.item.id === item.id );
                let newQty = parseInt( target.quantity ) + parseInt( itemQty )
                target.quantity = newQty
                target.discount = parseFloat( itemDiscount );
            } else{
                let product = { 'item' : item, quantity : parseInt( itemQty ) , discount : parseFloat( itemDiscount ) }
                productsInInvoice.push( product )
            }
            setItem( null );
            setItemQty( 1 );
            setItemDiscount( 0.00 );
            setBarcode( '' );
        } else {
            alert( 'no item has been selected' );
        };
    };

    const removeProductFromCart = ( index ) => {
        setProductsInInvoice(productsInInvoice.filter( 
            ( product, i ) => { 
                return ( i != index ) 
            }
        ))
    };

    return (        
        <Container maxWidth='xs'>
            <Paper style={{ padding : '10px'}} elevation={ 5 }>
                <Stack spacing={ 2 }>
                    <Typography variant='h6'>New Package</Typography>
                    <TextField
                        label='Customer Email' 
                        id='email'
                        value={ customerEmail }
                        onKeyDown={ getCustomer }
                        onChange={ handleEmailChange }
                    />
                    <TextField
                        label='Customer Phone' 
                        id='phone'
                        value={ customerPhone }
                        type='number'
                        onChange={ handleCustomerPhoneChange }
                    />
                    <TextField
                        id='name'
                        label='Customer Name' 
                        value={ customerName }
                        onChange={ handleCustomerNameChange }
                    />
                    <TextField
                        value={ orderNumber }
                        id='order'
                        label='Order Number' 
                        onChange={ handleOrderNumberChange }
                        onKeyUp={ validateInvoiceNumber }
                        error={ !validOrderNumber }
                        helperText={ orderNumberHelperText }
                    />
                    <FormControl fullWidth>
                        <InputLabel id="demo-simple-select-label">Collect Point</InputLabel>
                        <Select
                        id="vendor-select"
                        value={vendor || ''}
                        label="Collect Point"
                        onChange={ handleVendorChange }
                        >
                        {vendors ? vendors.map( 
                            ( vendor ) => {
                                return (
                                    <MenuItem
                                        key={vendor.id}
                                        value={vendor}
                                    >
                                        {vendor.name}
                                    </MenuItem>)}
                            ) 
                        :null}
                        
                        </Select>
                    </FormControl>
                    <FormControl fullWidth>
                        <InputLabel id="demo-simple-select-label">Payment Method</InputLabel>
                        <Select
                        id="payment-method-select"
                        value={ paymentMethod }
                        label="Payment Method"
                        onChange={ handlePaymentMethodChange }
                        >
                            <MenuItem
                                value="PENDING PAYMENT"
                            >
                                CASH ON DELIVERY
                            </MenuItem>
                            <MenuItem
                                value="PREPAID"
                            >
                                PREPAID
                            </MenuItem>
                        </Select>
                    </FormControl>
                    <Grid container spacing={ 1 } justifyContent="center" alignItems="center" style={{marginLeft: '-7px'}} >
                        <Grid item xs={ 8 }>
                            <TextField
                                value={ barcode }
                                id='barcode'
                                label='Item Code' 
                                onChange={ handleBarcodeChange }
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={ 4 }>
                            <TextField
                                value={ itemQty }
                                id='item-qty'
                                label='Qty' 
                                onChange={ handleItemQtyChange }
                                type='number'
                                fullWidth
                                />
                        </Grid>
                        <Grid item xs={ 4 }>
                            <TextField
                                value={ item && item.price || '0.00' }
                                id='item-price'
                                label='MRP'
                            />
                        </Grid>
                        <Grid item xs={ 4 }>
                            <TextField
                                value={ itemDiscount }
                                id='item-discount'
                                label='Discount' 
                                onChange={ handleItemDiscountChange }
                                fullWidth
                                type='number'
                            />
                        </Grid>
                        <Grid item xs={ 4 }>
                            <TextField
                                value={ item && parseFloat((item.price - itemDiscount) * itemQty).toFixed(2) || '0.00' }
                                id='item-total'
                                label='Total' 
                                fullWidth
                                
                            />
                        </Grid>
                        <Grid item xs={ 8 }>
                            <TextField
                                value={ item && item.description || '' }
                                id='item-description'
                                fullWidth
                                label='Description'
                            />
                        </Grid>
                        <Grid item xs={ 4 }>
                            <Button 
                                disabled={ !validBarcode } 
                                onClick={ addProductToInvoice }
                                variant="contained"
                                size="large">
                                Add
                            </Button>
                        </Grid>
                    </Grid>
                    <TableContainer>
                        <Table stickyHeader aria-label="sticky table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>
                                        #
                                    </TableCell>
                                    <TableCell>
                                        Barcode
                                    </TableCell>
                                    <TableCell>
                                        Description
                                    </TableCell>
                                    <TableCell>
                                        MRP
                                    </TableCell>
                                    <TableCell>
                                        QTY
                                    </TableCell>
                                    <TableCell>
                                        %
                                    </TableCell>
                                    <TableCell>
                                        Total
                                    </TableCell>
                                </TableRow>
                             

                            </TableHead>
                            <TableBody>
                                { productsInInvoice.map( (product, index) => {
                                    return (
                                        <TableRow>
                                            <TableCell>
                                                { index + 1 }
                                            </TableCell>
                                            <TableCell>
                                                { product.item.itemcode || product.item.barcode }
                                            </TableCell>
                                            <TableCell>
                                                { product.item.description }
                                            </TableCell>
                                            <TableCell>
                                                { product.item.price }
                                            </TableCell>
                                            <TableCell>
                                                { product.quantity }
                                            </TableCell>  
                                            <TableCell>
                                                { product.discount }
                                            </TableCell>
                                            <TableCell>
                                                { (product.item.price - product.discount) * product.quantity }
                                            </TableCell>
                                            <TableCell>
                                        <IconButton>
                                            <DeleteForeverOutlinedIcon onClick={ () => removeProductFromCart(index) }/>
                                        </IconButton>
                                    </TableCell>
                                        </TableRow>
                                    )
                                } ) }
                            </TableBody> 
                        </Table>
                    </TableContainer>

                </Stack>
            </Paper>
        </Container>
    )
};
