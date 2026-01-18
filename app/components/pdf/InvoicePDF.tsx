import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';
import type { BookingPayload } from '../../lib/booking';
import { calculatePriceBreakdown, formatCurrency } from '../../lib/priceMath';

// Register fonts if needed (optional, using default Helvetica for now for simplicity/speed)
// Font.register({ family: 'Roboto', src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf' });

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        padding: 40,
        fontFamily: 'Helvetica',
        fontSize: 10,
        color: '#333333',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 40,
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
        paddingBottom: 20,
    },
    headerLeft: {
        flexDirection: 'column',
    },
    headerRight: {
        flexDirection: 'column',
        alignItems: 'flex-end',
    },
    logo: {
        width: 150,
        marginBottom: 10,
    },
    companyName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#18234B',
        marginBottom: 4,
    },
    companyDetails: {
        fontSize: 10,
        color: '#666666',
        marginBottom: 2,
    },
    invoiceTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#A61924',
        marginBottom: 10,
    },
    invoiceMeta: {
        fontSize: 10,
        color: '#666666',
        marginBottom: 4,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#18234B',
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
        paddingBottom: 5,
        marginBottom: 10,
        textTransform: 'uppercase',
    },
    row: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    label: {
        width: '30%',
        fontWeight: 'bold',
        color: '#666666',
    },
    value: {
        width: '70%',
    },
    table: {
        marginTop: 20,
        borderWidth: 1,
        borderColor: '#EEEEEE',
        borderRadius: 4,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#F9FAFB',
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
        padding: 8,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
        padding: 8,
    },
    tableCellIndex: { width: '10%', color: '#666666' },
    tableCellDesc: { width: '60%', color: '#333333' },
    tableCellPrice: { width: '30%', textAlign: 'right', fontWeight: 'bold' },

    totalSection: {
        marginTop: 20,
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    totalRow: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
        paddingVertical: 3,
    },
    totalLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#666666',
    },
    totalValue: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#333333',
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        textAlign: 'center',
        color: '#999999',
        fontSize: 9,
        borderTopWidth: 1,
        borderTopColor: '#EEEEEE',
        paddingTop: 20,
    },
});

type InvoicePDFProps = {
    booking: BookingPayload;
};

// Helper: Format date
const formatDate = (dateStr: string) => {
    try {
        return new Date(dateStr).toLocaleDateString('en-AU', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    } catch (e) {
        return dateStr;
    }
};

export const InvoicePDF = ({ booking }: InvoicePDFProps) => {
    const pickupLoc = booking.pickupLocation || booking.dayTripPickup || booking.hourlyPickupLocation || 'N/A';
    const dropoffLoc = booking.dropoffLocation || booking.dayTripDestination || 'As Directed';

    // Determine description based on booking type
    let description = `Private Transfer: ${pickupLoc} to ${dropoffLoc}`;
    if (booking.bookingType === 'hourly') {
        description = `Hourly Charter (${booking.hourlyHours} Hours) - ${booking.hourlyVehicleType || 'Vehicle'}`;
    } else if (booking.bookingType === 'daytrip') {
        description = `Day Trip: ${pickupLoc} to ${dropoffLoc} (${booking.dayTripVehicleType || 'Vehicle'})`;
    }

    // Use centralized math
    const { totalPaid, serviceTotal, processingFee, gst, subtotalExGst } = calculatePriceBreakdown(booking.totalPrice);

    // Use DB invoice ID or fallback matching Admin Panel logic (INV-YYYYMMDD-SUBSTRING)
    let invoiceId = booking.invoiceId;

    if (!invoiceId) {
        if (booking.createdAt) {
            const datePart = new Date(booking.createdAt).toISOString().slice(0, 10).replace(/-/g, '');
            // Admin uses 4 chars of ID, let's match roughly or use random if ID not standard
            invoiceId = `INV-${datePart}-${booking.id?.slice(0, 4).toUpperCase() ?? 'PENDING'}`;
        } else {
            // Fallback if no createdAt (rare)
            invoiceId = `INV-${booking.id?.slice(-8).toUpperCase() ?? 'PENDING'}`;
        }
    }
    const dateStr = booking.createdAt ? new Date(booking.createdAt).toLocaleDateString('en-AU') : new Date().toLocaleDateString('en-AU');

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <Text style={styles.companyName}>SPL TRANSPORTATION</Text>
                        <Text style={styles.companyDetails}>ABN: 64 957 177 372</Text>
                        <Text style={styles.companyDetails}>Cairns, QLD, Australia</Text>
                        <Text style={styles.companyDetails}>+61 470 032 460</Text>
                        <Text style={styles.companyDetails}>spltransportation.australia@gmail.com</Text>
                    </View>
                    <View style={styles.headerRight}>
                        <Text style={styles.invoiceTitle}>INVOICE / RECEIPT</Text>
                        <Text style={styles.invoiceMeta}>Date: {dateStr}</Text>
                        <Text style={styles.invoiceMeta}>Invoice #: {invoiceId}</Text>
                        <Text style={styles.invoiceMeta}>Booking Ref: #{booking.id?.slice(-8).toUpperCase() ?? 'PENDING'}</Text>
                        <Text style={styles.invoiceMeta}>Status: {booking.status || 'PAID'}</Text>
                    </View>
                </View>

                {/* Customer Details */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Bill To</Text>
                    <View style={styles.row}>
                        <Text style={styles.label}>Name:</Text>
                        <Text style={styles.value}>{booking.fullName}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Email:</Text>
                        <Text style={styles.value}>{booking.email}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Phone:</Text>
                        <Text style={styles.value}>{booking.contactNumber}</Text>
                    </View>
                </View>

                {/* Trip Details */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Trip Details</Text>
                    <View style={styles.row}>
                        <Text style={styles.label}>Date & Time:</Text>
                        <Text style={styles.value}>{formatDate(booking.pickupDate)} at {booking.pickupTime}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Pickup:</Text>
                        <Text style={styles.value}>{pickupLoc}</Text>
                    </View>
                    {booking.pickupAddress && (
                        <View style={styles.row}>
                            <Text style={styles.label}>Pickup Address:</Text>
                            <Text style={styles.value}>{booking.pickupAddress}</Text>
                        </View>
                    )}
                    <View style={styles.row}>
                        <Text style={styles.label}>Dropoff:</Text>
                        <Text style={styles.value}>{dropoffLoc}</Text>
                    </View>
                    {booking.dropoffAddress && (
                        <View style={styles.row}>
                            <Text style={styles.label}>Dropoff Address:</Text>
                            <Text style={styles.value}>{booking.dropoffAddress}</Text>
                        </View>
                    )}
                    <View style={styles.row}>
                        <Text style={styles.label}>Passengers:</Text>
                        <Text style={styles.value}>{booking.passengers}</Text>
                    </View>
                    {booking.flightNumber && (
                        <View style={styles.row}>
                            <Text style={styles.label}>Flight Number:</Text>
                            <Text style={styles.value}>{booking.flightNumber}</Text>
                        </View>
                    )}
                </View>

                {/* Invoice Item Table */}
                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text style={styles.tableCellIndex}>#</Text>
                        <Text style={styles.tableCellDesc}>Description</Text>
                        <Text style={styles.tableCellPrice}>Amount</Text>
                    </View>
                    <View style={styles.tableRow}>
                        <Text style={styles.tableCellIndex}>1</Text>
                        <Text style={styles.tableCellDesc}>{description}</Text>
                        <Text style={styles.tableCellPrice}>{formatCurrency(serviceTotal, booking.currency)}</Text>
                    </View>
                </View>

                {/* Total & Breakdown */}
                <View style={styles.totalSection}>
                    <View style={{ width: '50%' }}>
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Subtotal (Excl. GST):</Text>
                            <Text style={styles.totalValue}>{formatCurrency(subtotalExGst, booking.currency)}</Text>
                        </View>
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>GST (10%):</Text>
                            <Text style={styles.totalValue}>{formatCurrency(gst, booking.currency)}</Text>
                        </View>
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Service Total:</Text>
                            <Text style={styles.totalValue}>{formatCurrency(serviceTotal, booking.currency)}</Text>
                        </View>
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Processing Fee (2.5%):</Text>
                            <Text style={styles.totalValue}>{formatCurrency(processingFee, booking.currency)}</Text>
                        </View>
                        <View style={[styles.totalRow, { marginTop: 10, borderTopWidth: 1, borderTopColor: '#EEEEEE', paddingTop: 5 }]}>
                            <Text style={[styles.totalLabel, { fontSize: 14, color: '#A61924' }]}>Total Paid:</Text>
                            <Text style={[styles.totalValue, { fontSize: 14, color: '#A61924' }]}>{formatCurrency(totalPaid, booking.currency)}</Text>
                        </View>
                    </View>
                </View>

                {/* Footer */}
                <Text style={styles.footer}>
                    Thank you for choosing SPL Transportation. Please retain this invoice for your records.
                    {"\n"}
                    For any enquiries, please email spltransportation.australia@gmail.com
                </Text>
            </Page>
        </Document>
    );
};
