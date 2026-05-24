const axios = require('axios');

class DataTransmitter {
  constructor(dashboardUrl) {
    this.dashboardUrl = dashboardUrl;
    this.connected = false;
    this.retryInterval = 5000;
    this.retryTimer = null;
  }

  async connect() {
    try {
      const response = await axios.get(`${this.dashboardUrl}/api/health`);
      if (response.data.status === 'ok') {
        this.connected = true;
        if (this.retryTimer) {
          clearTimeout(this.retryTimer);
          this.retryTimer = null;
        }
        console.log(`✓ Connected to dashboard at ${this.dashboardUrl}`);
        return true;
      }
    } catch (error) {
      this.connected = false;
      this.scheduleRetry();
      return false;
    }

    this.connected = false;
    this.scheduleRetry();
    return false;
  }

  async sendData(data) {
    if (!this.connected) {
      return false;
    }

    try {
      const response = await axios.post(`${this.dashboardUrl}/api/hardware/data`, data);
      if (response.data.success) {
        return true;
      } else {
        console.error('Dashboard rejected data:', response.data.message);
        return false;
      }
    } catch (error) {
      console.error('Error sending data to dashboard:', error.message);
      this.connected = false;
      this.scheduleRetry();
      return false;
    }
  }

  async updateState(state) {
    if (!this.connected) {
      return false;
    }

    try {
      const response = await axios.post(`${this.dashboardUrl}/api/hardware/state`, { state });
      return response.data.success;
    } catch (error) {
      console.error('Error updating state:', error.message);
      return false;
    }
  }

  async resetData() {
    if (!this.connected) {
      return false;
    }

    try {
      const response = await axios.post(`${this.dashboardUrl}/api/hardware/reset`);
      return response.data.success;
    } catch (error) {
      console.error('Error resetting data:', error.message);
      return false;
    }
  }

  scheduleRetry() {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
    }

    this.retryTimer = setTimeout(async () => {
      console.log('Attempting to reconnect to dashboard...');
      await this.connect();
    }, this.retryInterval);
  }

  async disconnect() {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }
    this.connected = false;
    console.log('Disconnected from dashboard');
  }

  getConnectionStatus() {
    return this.connected;
  }
}

module.exports = DataTransmitter;
