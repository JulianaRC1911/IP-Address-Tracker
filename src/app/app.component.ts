import { AfterViewInit, Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'IP-Address-Tracker';
  private map?: L.Map;
  private marker?: L.Marker;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    window.onload = () => {
      this.initMap();
      this.getUserLocation();
      this.getIPAddress();
    };
  }

  initMap(): void {
    this.map = L.map('map').setView([0, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
      maxZoom: 18
    }).addTo(this.map);
  }

  getUserLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position: GeolocationPosition) => {
          const { latitude, longitude } = position.coords;
          this.addMarker(latitude, longitude);
          this.map?.setView([latitude, longitude], 13); 
        },
        (error: GeolocationPositionError) => {
          console.log(error);
        }
      );
    } else {
      console.log('Geolocation is not supported by this browser.');
    }
  }

  addMarker(latitude: number, longitude: number): void {
    const icon = L.icon({
      iconUrl: '../assets/icon-location.svg',
      iconSize: [32, 32],
      iconAnchor: [16, 32]
    });

    this.marker = L.marker([latitude, longitude], { icon }).addTo(this.map!);
  }

  getIPAddress(): void {
    this.http.get('https://api.ipify.org/?format=json').subscribe(
      (response: any) => {
        const ipAddress = response.ip;
        document.getElementById('ipAddress')!.textContent = ipAddress;
        this.searchAddress(ipAddress);
      },
      (error: any) => {
        console.log(error);
      }
    );
  }
  

  searchAddress(inputValue: string): void {
    const address = inputValue.trim();
    if (address) {
      if (this.isValidIPAddress(address)) {
        this.searchIPAddress(address);
      } else {
        this.searchDomain(address);
      }
    }
  }

  isValidIPAddress(address: string): boolean {
    const ipPattern = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
    return ipPattern.test(address);
  }

  searchIPAddress(ipAddress: string): void {
    const apiKey = 'at_EuQH84lR2kOg0vEtZt31iAsdDDVXD';
    if (this.marker) {
      this.map?.removeLayer(this.marker);
    }
  
    this.http.get<any>(`https://geo.ipify.org/api/v1?apiKey=${apiKey}&ipAddress=${ipAddress}`)
      .subscribe(data => {
        console.log(data)
        const { lat, lng, city, region, timezone } = data.location;
        this.addMarker(lat, lng);
        this.map?.setView([lat, lng], 13);
        document.getElementById('location')!.textContent = `${city}, ${region}`;
        document.getElementById('timezone')!.textContent = timezone;
        document.getElementById('isp')!.textContent = data.isp;
      }, error => {
        console.log(error);
      });
  }
  
  

  searchDomain(domain: string): void {
    const apiKey = 'at_EuQH84lR2kOg0vEtZt31iAsdDDVXD';

    if (this.marker) {
      this.map?.removeLayer(this.marker);
    }

    this.http.get<any>(`https://geo.ipify.org/api/v1?apiKey=${apiKey}&domain=${domain}`)
      .subscribe(data => {
        const { lat, lng } = data.location;
        this.addMarker(lat, lng);
        this.map?.setView([lat, lng], 13); 
      }, error => {
        console.log(error);
      });
  }
}
