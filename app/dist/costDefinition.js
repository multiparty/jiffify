'use strict';

module.exports = {
  'add': function add(type) {
    return '0';
  },
  'mult': function mult(type) {
    if (type === 'NumericLiteral') {
      return '0';
    }
    return '2*n+3';
  },
  'xor_bit': function xor_bit(type) {
    if (type === 'NumericLiteral') {
      return '0';
    }
    return '2*n+3';
  },
  'gt': function gt(type) {
    return '2*n*l+4*l+2*n+2';
  },
  'lt': function lt(type) {
    return '2*n*l+4*l+2*n+2';
  },
  'gte': function gte(type) {
    return '2*n*l+4*l+2*n+2';
  },
  'lte': function lte(type) {
    return '2*n*l+4*l+2*n+2';
  },
  'eq': function eq(type) {
    return '4*n*l+8*l+6*n+7';
  },
  'neq': function neq(type) {
    return '4*n*l+8*l+6*n+7';
  },
  'not': function not(type) {
    return '0';
  }
};