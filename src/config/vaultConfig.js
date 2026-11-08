import { Star, UserRound, Wallet, MapPin, FileText } from 'lucide-react';
export const nav = [
  ['Favorites', Star],
  ['Logins', UserRound],
  ['Wallet', Wallet],
  ['Addresses', MapPin],
  ['Notes', FileText],
];
export const fields = {
  Logins: ['Title', 'Website', 'Username', 'Password', 'Notes'],
  Wallet: [
    'Title',
    'Card number',
    'Expiration',
    'CVV/CVC',
    'Card PIN',
    'Cardholder',
    'Notes',
  ],
  Addresses: [
    'Title',
    'Full name',
    'Email',
    'Phone',
    'Street',
    'City',
    'State',
    'Postal code',
    'Country',
  ],
  Notes: ['Title', 'Notes'],
};
export const accountFields = [
  'Title',
  'Account number',
  'Branch/Routing number',
  'Bank name',
  'Account owner',
  'Notes',
];
export const sensitiveFields = [
  'Password',
  'Card number',
  'CVV/CVC',
  'Card PIN',
  'Account number',
];
