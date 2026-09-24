package com.yourschool.app;

import android.Manifest;
import android.app.DownloadManager;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.webkit.CookieManager;
import android.webkit.DownloadListener;
import android.webkit.PermissionRequest;
import android.webkit.URLUtil;
import android.webkit.WebChromeClient;
import android.webkit.WebView;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.BridgeWebChromeClient;

import java.io.File;
import java.io.FileOutputStream;
import java.util.ArrayList;
import java.util.List;

public class MainActivity extends BridgeActivity {

    private static final int PERMISSION_REQUEST_CODE = 1001;
    private PermissionRequest pendingPermissionRequest;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Request system permissions on app launch for Camera, Mic, Audio, Notifications
        requestRequiredPermissions();

        if (this.bridge != null && this.bridge.getWebView() != null) {
            WebView webView = this.bridge.getWebView();

            // Enable WebRTC audio/video and auto-grant permission requests in WebView
            webView.setWebChromeClient(new BridgeWebChromeClient(this.bridge) {
                @Override
                public void onPermissionRequest(final PermissionRequest request) {
                    runOnUiThread(new Runnable() {
                        @Override
                        public void run() {
                            boolean hasCamera = ContextCompat.checkSelfPermission(MainActivity.this, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED;
                            boolean hasMic = ContextCompat.checkSelfPermission(MainActivity.this, Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED;

                            if (hasCamera && hasMic) {
                                request.grant(request.getResources());
                            } else {
                                pendingPermissionRequest = request;
                                requestRequiredPermissions();
                            }
                        }
                    });
                }
            });

            // Attach Native Download Manager & Base64 File Storage Listener to Capacitor WebView
            webView.setDownloadListener(new DownloadListener() {
                @Override
                public void onDownloadStart(String url, String userAgent, String contentDisposition, String mimeType, long contentLength) {
                    try {
                        if (url != null && url.startsWith("data:")) {
                            handleBase64DataDownload(url, contentDisposition, mimeType);
                            return;
                        }

                        // System DownloadManager for HTTP/HTTPS URLs
                        DownloadManager.Request request = new DownloadManager.Request(Uri.parse(url));
                        String safeMimeType = (mimeType != null && !mimeType.isEmpty()) ? mimeType : "application/pdf";
                        request.setMimeType(safeMimeType);

                        String cookies = CookieManager.getInstance().getCookie(url);
                        if (cookies != null) {
                            request.addRequestHeader("cookie", cookies);
                        }
                        if (userAgent != null) {
                            request.addRequestHeader("User-Agent", userAgent);
                        }
                        request.setDescription("Downloading file from TeachHub...");

                        String fileName = URLUtil.guessFileName(url, contentDisposition, safeMimeType);
                        if (fileName == null || fileName.isEmpty()) {
                            fileName = "teachhub_document.pdf";
                        }
                        // Sanitize filename against path traversal & invalid Android filename characters
                        fileName = fileName.replaceAll("[^a-zA-Z0-9._-]", "_");

                        request.setTitle(fileName);
                        request.allowScanningByMediaScanner();
                        request.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
                        request.setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, fileName);

                        DownloadManager dm = (DownloadManager) getSystemService(DOWNLOAD_SERVICE);
                        if (dm != null) {
                            dm.enqueue(request);
                            Toast.makeText(getApplicationContext(), "Downloading File: " + fileName, Toast.LENGTH_SHORT).show();
                        }
                    } catch (Exception e) {
                        e.printStackTrace();
                        Toast.makeText(getApplicationContext(), "Download Failed", Toast.LENGTH_SHORT).show();
                    }
                }
            });
        }
    }

    private void requestRequiredPermissions() {
        List<String> permissions = new ArrayList<>();
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
            permissions.add(Manifest.permission.CAMERA);
        }
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
            permissions.add(Manifest.permission.RECORD_AUDIO);
        }
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.MODIFY_AUDIO_SETTINGS) != PackageManager.PERMISSION_GRANTED) {
            permissions.add(Manifest.permission.MODIFY_AUDIO_SETTINGS);
        }
        if (Build.VERSION.SDK_INT >= 33) { // Build.VERSION_CODES.TIRAMISU
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                permissions.add(Manifest.permission.POST_NOTIFICATIONS);
            }
        }

        if (!permissions.isEmpty()) {
            ActivityCompat.requestPermissions(this, permissions.toArray(new String[0]), PERMISSION_REQUEST_CODE);
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == PERMISSION_REQUEST_CODE) {
            if (pendingPermissionRequest != null) {
                final PermissionRequest req = pendingPermissionRequest;
                pendingPermissionRequest = null;
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        req.grant(req.getResources());
                    }
                });
            }
        }
    }

    private void handleBase64DataDownload(String dataUrl, String contentDisposition, String mimeType) {
        try {
            int commaIndex = dataUrl.indexOf(",");
            if (commaIndex == -1) return;

            String header = dataUrl.substring(0, commaIndex);
            String base64Data = dataUrl.substring(commaIndex + 1);

            byte[] pdfAsBytes = android.util.Base64.decode(base64Data, android.util.Base64.DEFAULT);

            String detectedMime = mimeType;
            if (detectedMime == null || detectedMime.isEmpty() || detectedMime.equals("text/plain")) {
                if (header.contains("application/pdf")) detectedMime = "application/pdf";
                else if (header.contains("image/png")) detectedMime = "image/png";
                else if (header.contains("image/jpeg")) detectedMime = "image/jpeg";
                else if (header.contains("text/csv")) detectedMime = "text/csv";
                else detectedMime = "application/pdf";
            }

            String extension = ".pdf";
            if (detectedMime.contains("png")) extension = ".png";
            else if (detectedMime.contains("jpeg") || detectedMime.contains("jpg")) extension = ".jpg";
            else if (detectedMime.contains("csv")) extension = ".csv";
            else if (detectedMime.contains("excel") || detectedMime.contains("spreadsheet")) extension = ".xlsx";

            String fileName = "TeachHub_Doc_" + System.currentTimeMillis() + extension;
            fileName = fileName.replaceAll("[^a-zA-Z0-9._-]", "_");

            File downloadsDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS);
            File file = new File(downloadsDir, fileName);

            FileOutputStream os = new FileOutputStream(file, false);
            os.write(pdfAsBytes);
            os.flush();
            os.close();

            // Notify MediaScanner
            android.media.MediaScannerConnection.scanFile(this, new String[]{file.getAbsolutePath()}, new String[]{detectedMime}, null);

            Toast.makeText(getApplicationContext(), "Saved to Downloads: " + fileName, Toast.LENGTH_LONG).show();
        } catch (Exception e) {
            e.printStackTrace();
            Toast.makeText(getApplicationContext(), "Failed to save file", Toast.LENGTH_SHORT).show();
        }
    }
}
