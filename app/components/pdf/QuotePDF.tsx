import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import { formatCurrency } from '../../lib/priceMath';

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
    marginBottom: 30,
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
  companyName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#102A43',
    marginBottom: 4,
  },
  companyDetails: {
    fontSize: 10,
    color: '#666666',
    marginBottom: 2,
  },
  quoteTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0F766E',
    marginBottom: 8,
  },
  quoteMeta: {
    fontSize: 10,
    color: '#666666',
    marginBottom: 4,
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#102A43',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    paddingBottom: 5,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  label: {
    width: '30%',
    fontWeight: 'bold',
    color: '#666666',
  },
  value: {
    width: '70%',
    color: '#111827',
  },
  table: {
    marginTop: 15,
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
    paddingTop: 15,
  },
});

export type QuotePDFProps = {
  quote: {
    id: string;
    travelDate: string;
    travelTime: string;
    passengers: number;
    pickupAddress: string;
    dropoffAddress: string;
    checkInBags?: number;
    carryOnBags?: number;
    childSeats?: string;
    flightArrivalType?: string | null;
    flightArrivalNumber?: string | null;
    flightArrivalTime?: string | null;
    flightDepartureType?: string | null;
    flightDepartureNumber?: string | null;
    flightDepartureTime?: string | null;
    fullName: string;
    email: string;
    phone: string;
    message?: string | null;
    status: string;
    amount?: number | null;
    processingFee?: number | null;
    totalAmount?: number | null;
    createdAt: string;
  };
};

export const QuotePDF = ({ quote }: QuotePDFProps) => {
  const quoteRef = `QTE-${quote.id.slice(-8).toUpperCase()}`;
  const dateStr = quote.createdAt ? new Date(quote.createdAt).toLocaleDateString('en-AU') : new Date().toLocaleDateString('en-AU');

  const baseAmount = quote.amount || 0;
  const processingFee = quote.processingFee ?? Number((baseAmount * 0.025).toFixed(2));
  const totalAmount = quote.totalAmount ?? Number((baseAmount + processingFee).toFixed(2));
  const gst = Number((baseAmount * (10 / 110)).toFixed(2));
  const subtotalExGst = Number((baseAmount - gst).toFixed(2));

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
            <Text style={styles.quoteTitle}>TRIP QUOTE</Text>
            <Text style={styles.quoteMeta}>Date Issued: {dateStr}</Text>
            <Text style={styles.quoteMeta}>Quote Ref #: {quoteRef}</Text>
            <Text style={styles.quoteMeta}>Status: {quote.status || 'PENDING'}</Text>
          </View>
        </View>

        {/* Customer Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Prepared For:</Text>
            <Text style={styles.value}>{quote.fullName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Email Address:</Text>
            <Text style={styles.value}>{quote.email}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Phone Number:</Text>
            <Text style={styles.value}>{quote.phone}</Text>
          </View>
        </View>

        {/* Trip Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trip Details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Travel Date & Time:</Text>
            <Text style={styles.value}>{quote.travelDate} at {quote.travelTime}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Pickup Location:</Text>
            <Text style={styles.value}>{quote.pickupAddress}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Drop-off Location:</Text>
            <Text style={styles.value}>{quote.dropoffAddress}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Passengers & Luggage:</Text>
            <Text style={styles.value}>
              {quote.passengers} Passenger(s) • {quote.checkInBags ?? 0} Check-in Bag(s) • {quote.carryOnBags ?? 0} Carry-on Bag(s)
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Child Seats:</Text>
            <Text style={styles.value}>{quote.childSeats || 'No'}</Text>
          </View>
          {quote.flightArrivalNumber && (
            <View style={styles.row}>
              <Text style={styles.label}>Flight Arrival:</Text>
              <Text style={styles.value}>
                {quote.flightArrivalType || 'Arrival'} - Flight #{quote.flightArrivalNumber} ({quote.flightArrivalTime || 'N/A'})
              </Text>
            </View>
          )}
          {quote.flightDepartureNumber && (
            <View style={styles.row}>
              <Text style={styles.label}>Flight Departure:</Text>
              <Text style={styles.value}>
                {quote.flightDepartureType || 'Departure'} - Flight #{quote.flightDepartureNumber} ({quote.flightDepartureTime || 'N/A'})
              </Text>
            </View>
          )}
          {quote.message && (
            <View style={styles.row}>
              <Text style={styles.label}>Special Notes:</Text>
              <Text style={styles.value}>{quote.message}</Text>
            </View>
          )}
        </View>

        {/* Pricing Summary */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableCellIndex}>#</Text>
            <Text style={styles.tableCellDesc}>Description</Text>
            <Text style={styles.tableCellPrice}>Amount</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCellIndex}>1</Text>
            <Text style={styles.tableCellDesc}>Private Transfer Quote: {quote.pickupAddress} to {quote.dropoffAddress}</Text>
            <Text style={styles.tableCellPrice}>{formatCurrency(baseAmount)}</Text>
          </View>
        </View>

        {/* Breakdown */}
        <View style={styles.totalSection}>
          <View style={{ width: '50%' }}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal (Excl. GST):</Text>
              <Text style={styles.totalValue}>{formatCurrency(subtotalExGst)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>GST (10% Incl.):</Text>
              <Text style={styles.totalValue}>{formatCurrency(gst)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Base Service Fare:</Text>
              <Text style={styles.totalValue}>{formatCurrency(baseAmount)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Processing Fee (2.5%):</Text>
              <Text style={styles.totalValue}>{formatCurrency(processingFee)}</Text>
            </View>
            <View style={[styles.totalRow, { marginTop: 8, borderTopWidth: 1, borderTopColor: '#EEEEEE', paddingTop: 5 }]}>
              <Text style={[styles.totalLabel, { fontSize: 13, color: '#0F766E' }]}>Total Quoted Price:</Text>
              <Text style={[styles.totalValue, { fontSize: 13, color: '#0F766E' }]}>{formatCurrency(totalAmount)}</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          This quote is generated by SPL Transportation and is valid for 14 days from issue date.
          {"\n"}
          For booking confirmations or alterations, please contact spltransportation.australia@gmail.com or +61 470 032 460.
        </Text>
      </Page>
    </Document>
  );
};
